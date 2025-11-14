import { NextApiRequest, NextApiResponse } from 'next';
import { DiagnosticService } from '../../services/diagnostic';
import { PortfolioAllocation, InvestorProfile } from '../../types/portfolio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { allocation, profile, backtestPeriod } = req.body;

    // Validate input
    if (!allocation || !Array.isArray(allocation)) {
      return res.status(400).json({ error: 'Invalid allocation data' });
    }

    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ error: 'Invalid profile data' });
    }

    // Validate backtestPeriod if provided
    const allowedPeriods = [30, 90, 180, 365];
    const period = backtestPeriod && allowedPeriods.includes(backtestPeriod) ? backtestPeriod : 180;

    // Validate allocation percentages sum to 100
    const totalPercentage = allocation.reduce((sum: number, item: PortfolioAllocation) => 
      sum + (item.percentage || 0), 0
    );

    if (Math.abs(totalPercentage - 100) > 0.1) {
      return res.status(400).json({ 
        error: 'Allocation percentages must sum to 100%',
        currentTotal: totalPercentage
      });
    }

    // Validate profile fields
    const requiredProfileFields = ['horizon', 'riskTolerance', 'cryptoPercentage', 'objective'];
    for (const field of requiredProfileFields) {
      if (profile[field] === undefined || profile[field] === null) {
        return res.status(400).json({ error: `Missing required profile field: ${field}` });
      }
    }

    // Generate diagnostic
    const diagnosticService = new DiagnosticService();
    const diagnostic = await diagnosticService.generateDiagnostic(
      allocation as PortfolioAllocation[],
      profile as InvestorProfile,
      period
    );

    res.status(200).json(diagnostic);
  } catch (error) {
    console.error('Error generating diagnostic:', error);
    
    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API error')) {
        return res.status(503).json({ 
          error: 'External API temporarily unavailable',
          message: 'Please try again in a few minutes'
        });
      }
      
      if (error.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Please wait a moment before trying again'
        });
      }
    }

    res.status(500).json({ 
      error: 'Failed to generate diagnostic',
      message: 'An unexpected error occurred. Please try again.'
    });
  }
}
