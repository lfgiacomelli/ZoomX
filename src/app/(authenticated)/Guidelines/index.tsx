import { View, Text, ScrollView } from 'react-native';
import styles from './styles';

import Header from '@components/Header';
import useRighteousFont from '@hooks/Font/Righteous';
import useInterFont from '@hooks/Font/Inter';

export default function Guidelines() {
  const righteousLoaded = useRighteousFont();
  const interLoaded = useInterFont();

  if (!righteousLoaded || !interLoaded) return null;

  return (
    <>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.title}>Quais são as nossas{"\n"}Políticas e Diretrizes?</Text>

        <Text style={styles.intro}>
          No ZoomX, prezamos pela segurança, transparência e respeito em todas as nossas operações.
          A seguir, detalhamos as principais políticas e diretrizes que orientam nosso serviço, garantindo uma experiência confiável e justa para usuários e motoristas.
        </Text>

        <View style={styles.box}>
          <Text style={styles.text}>

            <Text style={styles.sectionTitle}>1. Privacidade e Proteção de Dados{"\n"}</Text>
            A privacidade dos nossos usuários é prioridade máxima. Coletamos apenas os dados necessários para o funcionamento do serviço, armazenando-os com segurança e criptografia. Nenhuma informação pessoal será compartilhada com terceiros sem autorização, em conformidade com a legislação vigente de proteção de dados (LGPD).

            {"\n\n"}
            <Text style={styles.sectionTitle}>2. Política de Pagamentos{"\n"}</Text>
            O ZoomX: Mobilidade Urbana opera exclusivamente com pagamentos digitais para garantir maior segurança e praticidade. Atualmente, aceitamos as seguintes formas de pagamento:
            {"\n\n"}• PIX (pagamento instantâneo)
            {"\n"}• Cartões de crédito (todas as bandeiras)
            {"\n"}• Cartões de débito (todas as bandeiras)
            {"\n\n"}Todos os pagamentos são processados por gateways seguros e criptografados. Não realizamos transações em dinheiro físico por questões de segurança e rastreabilidade. O valor da corrida é calculado automaticamente pelo aplicativo com base na distância e tempo da viagem, com total transparência sobre a tarifa antes da confirmação.

            {"\n\n"}
            <Text style={styles.sectionTitle}>3. Cancelamento de Corridas{"\n"}</Text>
            Entendemos que imprevistos acontecem. O cancelamento por parte do usuário é permitido sem custos nos primeiros 2 minutos após a solicitação. Após esse período, poderá ser aplicada uma taxa simbólica para compensar o tempo do motorista, coibindo abusos e garantindo respeito mútuo.

            {"\n\n"}
            <Text style={styles.sectionTitle}>4. Conduta dos Usuários{"\n"}</Text>
            Esperamos que todos os usuários mantenham uma postura ética e respeitosa. Não serão tolerados comportamentos ofensivos, discriminatórios ou abusivos contra motoristas ou outros usuários. O descumprimento pode resultar em advertências, bloqueios temporários ou permanentes.

            {"\n\n"}
            <Text style={styles.sectionTitle}>5. Responsabilidade dos Motoristas{"\n"}</Text>
            Motoristas parceiros devem agir com pontualidade, cortesia e atenção à segurança. Atrasos injustificados, recusas sem motivo ou condutas inadequadas serão monitoradas e poderão acarretar suspensão da parceria. Nosso objetivo é manter o padrão de excelência no atendimento.

            {"\n\n"}
            <Text style={styles.sectionTitle}>6. Uso Responsável da Plataforma{"\n"}</Text>
            O ZoomX é uma ferramenta para mobilidade segura e eficiente. Pedimos que todos os usuários façam uso consciente do aplicativo, evitando solicitações indevidas e respeitando os termos de uso. Denúncias de abusos serão analisadas com rigor para preservar a qualidade do serviço.

            {"\n\n"}
            <Text style={styles.sectionTitle}>7. Segurança{"\n"}</Text>
            A segurança é compromisso de todos. Recomendamos que as viagens sejam realizadas em locais públicos e iluminados sempre que possível. Em casos de emergência, utilize as funcionalidades de ajuda rápida disponíveis no app e contate as autoridades competentes.

            {"\n\n"}
            <Text style={styles.sectionTitle}>8. Atualizações das Políticas{"\n"}</Text>
            As políticas e diretrizes podem ser atualizadas periodicamente para melhor atender nossos usuários e se adequar a novas legislações. Recomendamos a leitura frequente desta seção para manter-se informado sobre quaisquer mudanças.

          </Text>
        </View>

        <Text style={styles.message}>
          Agradecemos por confiar no ZoomX. Juntos, construímos uma comunidade segura e eficiente.
        </Text>
      </ScrollView>
    </>
  );
}