import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@contexts/useAuth';

export async function agendarNotificacoes() {
  const { user } = useAuth();
  const userFirstName = user?.nome?.split(" ")[0] || "Usuário";

  const ultimaViagemStr = await AsyncStorage.getItem("ultimaViagem");
  let ultimaViagem: { via_origem: string, via_destino: string } | null = null;
  try {
    if (ultimaViagemStr) {
      ultimaViagem = JSON.parse(ultimaViagemStr);
    }
  } catch {
    ultimaViagem = null;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Bom dia, ${userFirstName}!`,
      body: "Os preços acabaram de cair, aproveite para pedir seu mototáxi para o trabalho!",
    },
    trigger: {
      hour: 6,
      minute: 0,
      repeats: true,
    } as any,
  });

  const mensagensBase = [
    { title: "Já pediu seu mototáxi hoje?", body: "Para que chegar atrasado se você pode ir com ZoomX?!" },
    { title: "Entregas, viagens, agilidade e segurança.", body: "O ZoomX pode proporcionar isso e muito mais." },
  ];

  const mensagens = [...mensagensBase];
  if (ultimaViagem) {
    mensagens.push({
      title: `Ei, ${userFirstName}!`,
      body: `Repita sua última viagem de ${ultimaViagem.via_origem} até ${ultimaViagem.via_destino}.`
    });
  }

  const STORAGE_KEY = '@ultima_notificacao_index';

  let ultimoIndexStr = await AsyncStorage.getItem(STORAGE_KEY);
  let ultimoIndex = ultimoIndexStr ? parseInt(ultimoIndexStr) : -1;

  const proximoIndex = (ultimoIndex + 1) % mensagens.length;
  const mensagem = mensagens[proximoIndex];

  const agendadas = await Notifications.getAllScheduledNotificationsAsync();
  for (const not of agendadas) {
    await Notifications.cancelScheduledNotificationAsync(not.identifier);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: mensagem.title,
      body: mensagem.body,
    },
    trigger: {
      hour: 11,
      minute: 0,
      repeats: true,
    } as any,
  });

  await AsyncStorage.setItem(STORAGE_KEY, proximoIndex.toString());
}
