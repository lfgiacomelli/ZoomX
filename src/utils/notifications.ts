import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  nome: string;
};

type Viagem = {
  via_origem: string;
  via_destino: string;
};

const NOTIFICATION_IDS_KEY = "@zoomx_notification_ids";
const STORAGE_INDEX_KEY = "@ultima_notificacao_index";

export async function agendarNotificacoes(user: User) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permissão para notificações negada");
    return;
  }

  const userFirstName = user?.nome?.split(" ")[0] || "Usuário";

  const ultimaViagemStr = await AsyncStorage.getItem("ultimaViagem");
  let ultimaViagem: Viagem | null = null;
  try {
    if (ultimaViagemStr) {
      ultimaViagem = JSON.parse(ultimaViagemStr);
    }
  } catch {
    ultimaViagem = null;
  }

  const mensagensBase = [
    {
      title: "Já garantiu sua corrida hoje?🚀",
      body: "Não perca tempo no trânsito, vá com ZoomX e chegue sempre na hora!",
    },
    {
      title: "Rapidez, segurança e conforto.",
      body: "Com ZoomX, suas viagens e entregas acontecem com qualidade e agilidade.",
    },

  ];

  const mensagens = [...mensagensBase];
  if (ultimaViagem) {
    mensagens.push({
      title: `Ei, ${userFirstName}!`,
      body: `Repita sua última viagem de ${ultimaViagem.via_origem} até ${ultimaViagem.via_destino}.`,
    });
  }

  let ultimoIndexStr = await AsyncStorage.getItem(STORAGE_INDEX_KEY);
  let ultimoIndex = ultimoIndexStr ? parseInt(ultimoIndexStr) : -1;
  const proximoIndex = (ultimoIndex + 1) % mensagens.length;
  const mensagem = mensagens[proximoIndex];

  const oldIdsStr = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
  if (oldIdsStr) {
    const oldIds: string[] = JSON.parse(oldIdsStr);
    for (const id of oldIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }

  const createdIds: string[] = [];

  const id1 = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Bom dia, ${userFirstName}!`,
      body: "Os preços acabaram de cair, aproveite para pedir seu mototáxi para o trabalho!",
    },
    trigger: { hour: 6, minute: 0, repeats: true } as any,
  });
  createdIds.push(id1);

  const id2 = await Notifications.scheduleNotificationAsync({
    content: {
      title: mensagem.title,
      body: mensagem.body,
    },
    trigger: { hour: 11, minute: 0, repeats: true } as any,
  });
  createdIds.push(id2);

  await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(createdIds));
  await AsyncStorage.setItem(STORAGE_INDEX_KEY, proximoIndex.toString());
}
