export function mostrarDataHoraAtual(): string {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0"); 
  const dia = String(agora.getDate()).padStart(2, "0");

  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");

  return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
}
