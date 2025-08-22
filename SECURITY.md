# Security Policy

## Reporting a Vulnerability
Please report security issues privately.

1. Email: security@suganworks.invalid (replace with a real alias)
2. Provide: description, reproduction steps, potential impact
3. Expect initial acknowledgement within 72 hours

## Supported Branches
Currently only `main` is supported.

## Do Not
- Open public issues for unpatched vulnerabilities
- Disclose details before a fix is released

## After Disclosure
We will assign severity, patch, and release an advisory. Credits given unless anonymity requested.

## Hardening Checklist (Internal)
- [ ] Rotate secrets quarterly
- [ ] Review Supabase RLS policies
- [ ] Run dependency audit monthly
- [ ] Add SAST (CodeQL) and Dependabot
