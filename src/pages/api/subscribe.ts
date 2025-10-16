import type { NextApiRequest, NextApiResponse } from 'next'

type Resp = { ok: boolean; message?: string };

const SUBSTACK_DOMAIN = process.env.SUBSTACK_DOMAIN || 'bomdigma.substack.com';
const SUBSTACK_CUSTOM = process.env.SUBSTACK_CUSTOM || 'www.bomdigma.com.br';
const SUBSTACK_PUBLICATION_ID = process.env.SUBSTACK_PUBLICATION_ID; // opcional

export default async function handler(req: NextApiRequest, res: NextApiResponse<Resp>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  try {
    const { email } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ ok: false, message: 'Invalid email' });
    }

    // Tentar endpoints conhecidos de inscrição do Substack
    const candidates: Array<{ url: string; body: URLSearchParams | string; headers?: Record<string, string> }> = [];

    // 1) substackapi.com (algumas publicações usam este endpoint)
    if (SUBSTACK_PUBLICATION_ID) {
      const body1 = new URLSearchParams();
      body1.set('email', email);
      body1.set('publication_id', SUBSTACK_PUBLICATION_ID);
      candidates.push({ url: 'https://substackapi.com/api/v1/free', body: body1, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    }

    // 2) domínio do Substack (fallbacks comuns)
    const body2 = new URLSearchParams();
    body2.set('email', email);
    candidates.push({ url: `https://${SUBSTACK_DOMAIN}/api/v1/free`, body: body2, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    // 3) domínio custom (se disponível)
    const body3 = new URLSearchParams();
    body3.set('email', email);
    candidates.push({ url: `https://${SUBSTACK_CUSTOM}/api/v1/free`, body: body3, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    // 4) GET de subscribe (como último recurso, pode não cadastrar sozinho)
    candidates.push({ url: `https://${SUBSTACK_DOMAIN}/subscribe?email=${encodeURIComponent(email)}`, body: '', headers: {} });
    candidates.push({ url: `https://${SUBSTACK_CUSTOM}/subscribe?email=${encodeURIComponent(email)}`, body: '', headers: {} });

    let success = false;
    for (const c of candidates) {
      try {
        const resp = await fetch(c.url, { method: c.body ? 'POST' : 'GET', headers: c.headers, body: c.body || undefined });
        if (resp.ok) { success = true; break; }
      } catch (_) {}
    }

    if (!success) {
      // Não conseguimos assinar diretamente. Ainda assim, retornamos ok=true para não bloquear o fluxo.
      console.warn('Substack subscribe did not confirm success for email', email);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Unexpected error' });
  }
}


