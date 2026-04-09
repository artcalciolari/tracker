# 🗓️ Tracker de Agendamentos SWUSA

> "Criei essa página simples para me ajudar no fluxo de agendamentos diários, sem precisar ficar escrevendo em um caderno para quem eu marquei ou deixei de marcar. Estamos em 2026, afinal de contas."

---

## ✨ Sobre o Projeto
Um painel web intuitivo e moderno, projetado especificamente para gerenciar, de forma rápida, a quantidade de agendamentos diários distribuídos entre as pessoas da equipe. Sem dor de cabeça, sem cadernos de anotações e com tudo salvo direto no seu navegador.

## 🚀 Funcionalidades
- ⚡ **Acesso Instantâneo e Local:** Seus agendamentos não são perdidos se você fechar a página. Tudo é garantido pelo `localStorage` do navegador.
- 👥 **Membros Dinâmicos:** Configure rapidamente sua quantidade de "Closers", personalize os nomes de cada um ou gere com numerações padrão.
- 🏠 **Opção Especial "Cafofo":** Inclusão imediata e opcional deste vendedor diretamente pelo painel de setup.
- 🎯 **Totalizadores:** Tenha tanto as contagens isoladas por indivíduo quanto a somatória do dia na mesma tela.
- 🎨 **Design Moderno:** Uma estética limpa feita com *Glassmorphism*, fácil para os olhos durante sua longa rotina de trabalho.
- 📅 **Google Calendar:** Visualize imediatamente os compromissos dos Closers para o dia atual direto do painel.

## 🛠️ O que foi usado?
O projeto utiliza uma stack direta, leve e sem atritos visando facilidade de alteração e deploy nas principais plataformas.
- **HTML5**
- **CSS3 (Vanilla)** com Design System base (paletas de cores e tipografia no padrão Inter)
- **Javascript Vanilla**, gerenciando estados e consumindo as APIs REST.
- **Google Identity Services & Calendar API** para o painel avançado de horários.

## 💻 Como Rodar?
Por não usar bundlers nem dependências pesadas, é incrivelmente fácil rodar:
1. Abra a pasta do projeto.
2. Inicie o projeto usando um *Live Server* no VS Code ou no seu editor preferido (Isso é obrigatório para o Google Calendar funcionar, já que a Google bloqueia execuções baseadas em duplo clique `file://`).
3. Preencha seus dados no modal inicial e conecte perfeitamente com sua conta. Você está pronto para decolar nas métricas.
