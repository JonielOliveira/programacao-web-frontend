# Join & Chat – Frontend

Interface web do **Join & Chat**, uma aplicação de troca de mensagens entre usuários, com funcionalidades de cadastro, autenticação, convites, conexões e chat em tempo real.

---

## :computer: Requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados na sua máquina:

- [Node.js](https://nodejs.org/) (versão recomendada: LTS)
- [npm](https://www.npmjs.com/) (geralmente já incluído com o Node.js)
- Editor de código como [VS Code](https://code.visualstudio.com/) (opcional, mas recomendado)

---

## :gear: Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Axios](https://axios-http.com/)

---

## :rocket: Como rodar o projeto localmente

Você pode rodar o projeto de duas formas:

- **Apenas localmente:** acessível somente pela máquina atual (localhost).
- **Na rede local:** acessível por outros dispositivos na mesma rede (LAN).

:pencil: Nota:
Nas instruções a seguir, utilizamos como exemplo as portas `:3333` para o **[backend](https://github.com/JonielOliveira/programacao-web-backend)** e `:3000` para o **frontend**.
Esses valores são apenas ilustrativos — você pode configurar outras portas se preferir, desde que mantenha a consistência entre os arquivos `.env` e os serviços em execução.



### 1. Clone o repositório

```bash
git clone https://github.com/JonielOliveira/programacao-web-frontend.git
```

Depois, entre no diretório do frontend:

```bash
cd programacao-web-frontend/frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Depois, edite o arquivo `.env` e configure a variável `NEXT_PUBLIC_API_URL` com a URL do seu [backend](https://github.com/JonielOliveira/programacao-web-backend).

#### ➤ Para rodar **localmente** (acesso apenas pela sua máquina):
```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

#### ➤ Para rodar na **rede local** (acesso por outros dispositivos):
1. Descubra o IP da sua máquina na rede:

   - Linux/macOS:
     ```bash
     ip a
     ```
   - Windows:
     ```cmd
     ipconfig
     ```

   Procure o IP da interface conectada (exemplo: `192.168.0.105`).

2. Configure o `.env`:
```env
NEXT_PUBLIC_API_URL="http://192.168.0.105:3333"
```

3. Certifique-se de que o [backend](https://github.com/JonielOliveira/programacao-web-backend) também esteja acessível na rede local, na porta 3333.

4. Libere a porta 3000 no firewall da sua máquina, se necessário:

   - Linux (UFW):
     ```bash
     sudo ufw allow 3000
     ```
   - Windows: vá até "Firewall do Windows > Regras de Entrada" e permita conexões na porta 3000.

---

### 4. Rode o servidor de desenvolvimento

#### ➤ Para acesso **somente local**:
```bash
npm run dev:local
```

Acesse: [http://localhost:3000](http://localhost:3000)

#### ➤ Para acesso **pela rede local**:
```bash
npm run dev:lan
```

Acesse pelo navegador de outro dispositivo da mesma rede:  
[http://192.168.0.105:3000](http://192.168.0.105:3000)

---
