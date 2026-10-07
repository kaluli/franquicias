export const CATEGORIES = [
  { value: "restauracion", label: "Restauración", emoji: "🍔" },
  { value: "retail", label: "Retail", emoji: "🛍️" },
  { value: "servicios", label: "Servicios", emoji: "🧰" },
  { value: "salud", label: "Salud / Wellness", emoji: "🧘" },
  { value: "educacion", label: "Educación", emoji: "🎓" },
  { value: "fitness", label: "Fitness", emoji: "🏋️" },
  { value: "tecnologia", label: "Tecnología", emoji: "💻" },
  { value: "inmobiliario", label: "Inmobiliario", emoji: "🏠" },
  { value: "mascotas", label: "Mascotas", emoji: "🐾" },
  { value: "automocion", label: "Automoción", emoji: "🚗" },
  { value: "vending", label: "Vending", emoji: "🥤" },
  { value: "otros", label: "Otros", emoji: "📦" },
] as const;

export function categoryOf(value: string | null | undefined) {
  return CATEGORIES.find((c) => c.value === value);
}

export const STATUSES = [
  { value: "interesante", label: "Interesante", emoji: "🟢" },
  { value: "analizar", label: "Analizar", emoji: "🟡" },
  { value: "finalista", label: "Finalista", emoji: "⭐" },
  { value: "negociando", label: "Negociando", emoji: "🤝" },
  { value: "descartada", label: "Descartada", emoji: "🔴" },
] as const;

export type Status = (typeof STATUSES)[number]["value"];

export function statusOf(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[1];
}

// Criterios de evaluación (1–5 estrellas) y su peso en el score.
export const CRITERIA = [
  { key: "rentabilidad", label: "Rentabilidad", emoji: "💰", weight: 20 },
  { key: "crecimiento", label: "Potencial de crecimiento", emoji: "📈", weight: 15 },
  {
    key: "independencia",
    label: "Independencia del propietario",
    emoji: "🧑‍💼",
    weight: 15,
    hint: "5 = puede funcionar prácticamente sin mí",
  },
  { key: "recurrencia", label: "Recurrencia", emoji: "🔄", weight: 10 },
  { key: "central", label: "Calidad de la central", emoji: "🏢", weight: 10 },
  {
    key: "riesgo",
    label: "Bajo riesgo",
    emoji: "🛡️",
    weight: 15,
    hint: "5 = bajo riesgo",
  },
  { key: "salida", label: "Facilidad de salida", emoji: "🚪", weight: 5 },
  { key: "encaje", label: "Encaje conmigo", emoji: "🎯", weight: 10 },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

export const RED_FLAG_PRESETS = [
  "No proporciona números",
  "Royalty demasiado alto",
  "Mucha dependencia del propietario",
  "Muchas franquicias cerradas",
  "Contrato complicado",
  "Inversión elevada",
];

export const GREEN_FLAG_PRESETS = [
  "Alta recurrencia",
  "Buen margen",
  "Modelo escalable",
  "Franquiciados satisfechos",
  "Bajo coste de personal",
  "Buena central",
];

export type QuestionDef = { id: string; category: string; text: string };

export const CRITICAL_QUESTIONS: QuestionDef[] = [
  "¿Cuál es la inversión total REAL?",
  "¿Cuál es la facturación media?",
  "¿Cuál es el beneficio operativo?",
  "¿Cuál es el ROI?",
  "¿Cuánto tarda el break-even?",
  "¿Cuántas horas trabaja el propietario?",
  "¿Puede funcionar con un encargado?",
  "¿Cuántas franquicias han cerrado?",
  "¿Puedo hablar con 3 franquiciados actuales?",
  "¿Puedo ver números reales de una unidad?",
  "¿Por qué debería pagar por esta franquicia en lugar de montar este mismo negocio yo sola?",
].map((text, i) => ({ id: `crit-${i + 1}`, category: "Críticas", text }));

const GROUPS: [string, string, string[]][] = [
  ["inv", "Inversión", [
    "¿Cuál es la inversión total REAL?",
    "¿Cuánto capital propio recomiendan?",
    "¿Qué costes adicionales existen?",
    "¿Existe capital circulante recomendado?",
    "¿Hay costes ocultos?",
  ]],
  ["ren", "Rentabilidad", [
    "¿Cuál es la facturación media de una unidad madura?",
    "¿Cuál es el beneficio operativo medio?",
    "¿Cuál es el margen operativo?",
    "¿Cuánto tarda en llegar al break-even?",
    "¿Cuál es el ROI habitual?",
    "¿Cuánto tarda en recuperarse la inversión?",
    "¿Cuántas horas semanales trabaja el propietario?",
  ]],
  ["neg", "Modelo de negocio", [
    "¿Cuál es el cliente objetivo?",
    "¿Cuál es el ticket medio?",
    "¿Qué porcentaje de ventas son recurrentes?",
    "¿Cuál es la tasa de repetición?",
    "¿Cómo consiguen clientes?",
    "¿Qué porcentaje viene del marketing de la central?",
    "¿Cuál es el principal competidor?",
    "¿Cuál es vuestra ventaja frente a montar el negocio independientemente?",
  ]],
  ["cen", "Central", [
    "¿Cuántos franquiciados tienen?",
    "¿Cuántas unidades propias tienen?",
    "¿Cuántas franquicias han cerrado en los últimos 3 años?",
    "¿Por qué cerraron?",
    "¿Cuántos franquiciados tienen más de una unidad?",
    "¿Cuál es el porcentaje de renovación?",
    "¿Cuánto tiempo lleva funcionando la empresa?",
    "¿Cuánto tiempo lleva franquiciando?",
  ]],
  ["cos", "Costes", [
    "¿Qué royalty cobran?",
    "¿Qué canon de publicidad cobran?",
    "¿Qué otros fees existen?",
    "¿Qué proveedores son obligatorios?",
    "¿Puedo negociar proveedores?",
    "¿Hay compras mínimas obligatorias?",
  ]],
  ["ter", "Territorio", [
    "¿Existe exclusividad territorial?",
    "¿Cuál es el radio?",
    "¿Pueden abrir otra unidad cerca?",
    "¿Cómo se determina la zona protegida?",
  ]],
  ["sop", "Soporte", [
    "¿Qué formación inicial ofrecen?",
    "¿Cuánto dura?",
    "¿Qué formación continua ofrecen?",
    "¿Qué soporte de marketing proporcionan?",
    "¿Qué soporte operativo proporcionan?",
    "¿Cuántas personas tiene el equipo de soporte?",
  ]],
  ["rie", "Riesgo", [
    "¿Cuál es el mayor problema actual de los franquiciados?",
    "¿Cuál es el perfil de franquiciado que NO funciona?",
    "¿Cuál ha sido la última franquicia que cerró?",
    "¿Por qué cerró?",
    "¿Cuál es la unidad que menos factura?",
    "¿Por qué factura tan poco?",
    "¿Qué porcentaje de franquiciados no renueva?",
  ]],
  ["sal", "Salida", [
    "¿Puedo vender o traspasar la franquicia?",
    "¿Cuánto cuesta?",
    "¿La central debe aprobar al comprador?",
    "¿Existe penalización por salida anticipada?",
    "¿Qué ocurre cuando termina el contrato?",
    "¿Cuánto cuesta renovar?",
  ]],
];

export const QUESTION_GROUPS = GROUPS.map(([prefix, category, qs]) => ({
  category,
  questions: qs.map(
    (text, i): QuestionDef => ({ id: `${prefix}-${i + 1}`, category, text }),
  ),
}));

export const ALL_QUESTIONS: QuestionDef[] = [
  ...CRITICAL_QUESTIONS,
  ...QUESTION_GROUPS.flatMap((g) => g.questions),
];

export const ANSWER_STATUSES = [
  { value: "answered", label: "Respondida", emoji: "✅" },
  { value: "not_asked", label: "No preguntado", emoji: "❓" },
  { value: "unknown", label: "No saben / no responden", emoji: "⚠️" },
] as const;

export type AnswerStatus = (typeof ANSWER_STATUSES)[number]["value"];
