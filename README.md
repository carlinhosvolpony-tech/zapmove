# 🚀 ZapMove - Transporte & Delivery

Aplicativo web moderno, rápido e responsivo para solicitação de serviços de **Delivery & Entregas**, **Moto Táxi**, **Carro / Corrida** e **Transporte Escolar (Moto Escolar)** com integração e validação direta pelo WhatsApp: **(98) 98459-5785**.

---

## 📱 Recursos & Funcionalidades

- **Interface Limpa e Intuitiva**: Tela inicial simplificada e enxuta para acesso rápido a cada categoria de serviço.
- **Tabela Oficial de Bairros e Tarifas**:
  - **Delivery / Entregas**:
    - Centro: R$ 3,00
    - Recanto Florido: R$ 3,00
    - Mearim: R$ 3,00
    - Cabana do Boi: R$ 4,00
    - Novo Horizonte: R$ 4,00
    - Campo de Aviação: R$ 4,00
    - Coreia: R$ 4,00
    - Trizidela: R$ 5,00
    - Cafezal: R$ 4,00
    - Roseana Sarney: R$ 3,00
    - Malvinas: R$ 3,00
    - Maestro Gonçalves Martins: R$ 3,00
    - Conjunto Habitacional: R$ 4,00
    - Cemar: R$ 3,00
    - Flores: R$ 3,00
    - Tamarineiro: R$ 4,00
    - Cruzeiro: R$ 3,00
    - Botafogo: R$ 4,00
    - Perimirim: R$ 5,00
    - Catarina: R$ 3,00
  - **Moto Táxi**: Valor base do bairro + acréscimo de **R$ 2,00** por rota.
  - **Moto Escolar**: Mensalidade fixa de **R$ 200,00** com seleção de turno, escola e itinerário seguro.
  - **Carro Particular / Corrida**: Opção sob consulta e cotação direta.
- **Validação Automática no WhatsApp**:
  - Número oficial configurado: **`5598984595785`**
  - Montagem de mensagem formatada com todos os dados: origem, destino, bairro, taxa calculada, método de pagamento, observações e contato.
- **Design Responsivo & Mobile First**: Otimizado para navegadores mobile, PWA-ready e desktop.

---

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Vite 6**
- **Tailwind CSS v4**
- **Lucide React** (Ícones modernos)
- **Motion / Framer Motion** (Animações suaves)

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** (ou **pnpm** / **yarn** / **bun**)

### Instalação

1. Clone ou extraia o repositório em sua máquina:
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd zapmove
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse em seu navegador:
```
http://localhost:3000
```

---

## 🏗️ Como Gerar a Build de Produção

Para criar os arquivos estáticos otimizados para deploy:

```bash
npm run build
```

Os arquivos prontos para publicação estarão disponíveis na pasta `dist/`.

---

## 📤 Como Vincular e Enviar (Push) para o seu GitHub

Se você já possui um repositório criado no GitHub (vazio):

```bash
# 1. Defina a branch principal como main
git branch -M main

# 2. Adicione o seu repositório remoto do GitHub (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 3. Envie os arquivos para o GitHub
git push -u origin main
```

Caso queira atualizar alterações futuras:
```bash
git add .
git commit -m "feat: novas melhorias"
git push
```

---

## 📞 Contato & Suporte

- **WhatsApp Oficial ZapMove**: `+55 (98) 98459-5785`
