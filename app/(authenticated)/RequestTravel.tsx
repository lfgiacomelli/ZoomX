import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

const EnviarSolicitacao = () => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [enderecoPartida, setEnderecoPartida] = useState('');
  const [enderecoDestino, setEnderecoDestino] = useState('');
  const [aguardando, setAguardando] = useState(false);
  const [resposta, setResposta] = useState('');
  const [timer, setTimer] = useState(60);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  const confirmarSolicitacao = async () => {
    const novaSolicitacao = {
      nome,
      tipo,
      enderecoPartida,
      enderecoDestino,
    };

    try {
      const response = await fetch('http://192.168.0.16/tcc/app/enviar_solicitacao.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaSolicitacao),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResposta('Solicitação recebida com sucesso!');
        setAguardando(true);
        setTimer(60);

        const interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setResposta('Tempo expirado');
              setAguardando(false);
            }
            return prev - 1;
          });
        }, 1000);

        setTimerInterval(interval);
      } else {
        setResposta(data.message);
        setAguardando(false);
      }
    } catch (error) {
      console.error('Erro ao fazer solicitação:', error);
      setResposta('Erro ao fazer solicitação');
      setAguardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Tipo de serviço (Moto Táxi/Entrega)"
        value={tipo}
        onChangeText={setTipo}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço de Partida"
        value={enderecoPartida}
        onChangeText={setEnderecoPartida}
      />
      <TextInput
        style={styles.input}
        placeholder="Endereço de Destino"
        value={enderecoDestino}
        onChangeText={setEnderecoDestino}
      />
      <Button
        title="Confirmar Solicitação"
        onPress={confirmarSolicitacao}
        disabled={aguardando}
      />
      {aguardando && <Text>Esperando resposta... Tempo restante: {timer}s</Text>}
      {resposta && <Text>{resposta}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default EnviarSolicitacao;
