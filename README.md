# 🪒 Barbearia Bot — Simulação de Agendamento

Prova de conceito de automação de agendamento para barbearia via WhatsApp + Google Agenda.

## O que é

Simulação interativa de um bot de WhatsApp para agendamento em barbearia, com:

- ✂️ **3 serviços:** Corte, Barba, Corte + Barba
- 💈 **2 barbeiros:** Victor e Marcos
- 📅 **Agendamento** por serviço → barbeiro → dia → horário
- 🔄 **Reagendamento** de horários existentes
- ❌ **Cancelamento** com confirmação
- ⚡ **Distribuição automática** (round-robin) quando o cliente escolhe "Qualquer um disponível"
- ← **Navegação** com botão Voltar em cada etapa

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/barbearia-bot/`

## Como publicar no GitHub Pages

1. Suba o código para um repositório chamado `barbearia-bot`
2. Vá em **Settings → Pages → Source** e selecione **GitHub Actions**
3. Faça um push para a branch `main`
4. O deploy acontece automaticamente

O site ficará disponível em:
```
https://seu-usuario.github.io/barbearia-bot/
```

## Tecnologias

- React 18
- Vite 5
- GitHub Actions (CI/CD)
- GitHub Pages (hospedagem)

---

*Desenvolvido como PoC de automação — José Júnior*
