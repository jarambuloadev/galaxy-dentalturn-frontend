export interface ServiceVisual {
  icon: string;
  gradientClass: string;
}

const DEFAULT_VISUAL: ServiceVisual = {
  icon: 'medical_services',
  gradientClass: 'svc-gradient--blue',
};

const SERVICE_VISUALS: { match: RegExp; visual: ServiceVisual }[] = [
  { match: /ortodoncia/i, visual: { icon: 'adjust', gradientClass: 'svc-gradient--indigo' } },
  { match: /control general/i, visual: { icon: 'health_and_safety', gradientClass: 'svc-gradient--sky-blue' } },
  { match: /limpieza/i, visual: { icon: 'auto_awesome', gradientClass: 'svc-gradient--cyan' } },
  { match: /extracci[oó]n/i, visual: { icon: 'vaccines', gradientClass: 'svc-gradient--violet' } },
  { match: /endodoncia|conducto/i, visual: { icon: 'vaccines', gradientClass: 'svc-gradient--purple' } },
  { match: /blanqueamiento/i, visual: { icon: 'auto_fix_high', gradientClass: 'svc-gradient--sky-indigo' } },
  { match: /implantes?/i, visual: { icon: 'workspace_premium', gradientClass: 'svc-gradient--indigo-purple' } },
  { match: /odontopediatr[ií]a/i, visual: { icon: 'child_care', gradientClass: 'svc-gradient--blue-sky' } },
  { match: /urgencias?/i, visual: { icon: 'notification_important', gradientClass: 'svc-gradient--fuchsia' } },
];

export function getServiceVisual(serviceName: string): ServiceVisual {
  const found = SERVICE_VISUALS.find(({ match }) => match.test(serviceName));
  return found?.visual ?? DEFAULT_VISUAL;
}
