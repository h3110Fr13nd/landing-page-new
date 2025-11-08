interface PricingPlan {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  originalMonthlyPrice: string | null;
  originalAnnualPrice: string | null;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  popular: boolean;
  features: string[];
  limitations: string[];
  cta: string;
  href: string;
}

export type { PricingPlan };