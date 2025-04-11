const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "https://obscure-garbanzo-pxqrqxxp55xcrggg-3000.app.github.dev",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

let solicitacoes = [];

io.on("connection", (socket) => {
    console.log(`🔌 Novo usuário conectado: ${socket.id}`);

    socket.emit("solicitacoesIniciais", solicitacoes);

    socket.on("novaSolicitacao", (dados) => {
        console.log("📩 Nova solicitação recebida:", dados);

        const novaSolicitacao = {
            id: Date.now(),
            ...dados,
            status: "Pendente",
            socketId: socket.id
        };

        solicitacoes.push(novaSolicitacao);
        io.emit("solicitacaoRecebida", novaSolicitacao);
    });


    socket.on("responderSolicitacao", ({ id, status }) => {
        const solicitacao = solicitacoes.find((sol) => sol.id === id);

        if (solicitacao) {
            solicitacao.status = status;
            console.log(`✅ Solicitação ${id} (${solicitacao.nome}) foi marcada como ${status}`);

            io.emit("solicitacaoAtualizada", solicitacao);
        } else {
            console.error("❌ Solicitação não encontrada:", id);
        }
    });

    socket.on("removerSolicitacao", (id) => {
        const index = solicitacoes.findIndex((sol) => sol.id === id);

        if (index !== -1) {
            solicitacoes.splice(index, 1); 
            console.log(`🗑️ Solicitação removida: ${id}`);

            io.emit("solicitacaoRemovida", id);
        } else {
            console.error("❌ Erro ao remover: Solicitação não encontrada", id);
        }
    });

    socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
        solicitacoes = solicitacoes.filter(sol => sol.socketId !== socket.id);
        io.emit("solicitacoesIniciais", solicitacoes);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
