import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  Globe,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  Monitor,
  Package,
  Shield,
  ShoppingCart,
  Smartphone,
  Target,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";

const stats = [
  { value: "99.95%", label: "Platform uptime" },
  { value: "< 5 min", label: "Meta onboarding flow" },
  { value: "₹0.50", label: "Live campaign cost visibility" },
  { value: "24/7", label: "Support readiness" },
];

const trustSignals = [
  "Official Meta onboarding flow",
  "Template-led campaign governance",
  "Prepaid wallet with send controls",
  "Built for Shopify and D2C operations",
];

const enterprisePillars = [
  {
    icon: Shield,
    title: "Meta-grade setup",
    desc: "Connect business portfolio, number, and account status from one controlled onboarding flow.",
  },
  {
    icon: Wallet,
    title: "Finance-safe sending",
    desc: "Know campaign cost before launch, warn on low balance, and block sends when prepaid funds are empty.",
  },
  {
    icon: LayoutTemplate,
    title: "Template-first campaigns",
    desc: "Keep marketing and utility messaging organized with approval-aware templates and reusable journeys.",
  },
  {
    icon: BarChart3,
    title: "Operator visibility",
    desc: "Track wallet usage, campaign performance, contacts, and recent activity from one dashboard.",
  },
];

const useCases = [
  {
    title: "Shopify Brands",
    points: [
      "Recover abandoned carts",
      "Broadcast sale launches and drops",
      "Send shipping and COD confirmation updates",
    ],
  },
  {
    title: "D2C Teams",
    points: [
      "Segment contacts by behavior and tags",
      "Reuse approved templates across campaigns",
      "Control spend with prepaid wallet governance",
    ],
  },
  {
    title: "Local Businesses",
    points: [
      "Run appointment or order reminders",
      "Promote offers to repeat customers",
      "Manage contacts without technical complexity",
    ],
  },
];

const operatingSystem = [
  {
    icon: Building2,
    title: "Onboard",
    desc: "Create workspace, connect WhatsApp Business, add balance, upload contacts.",
  },
  {
    icon: Users,
    title: "Organize",
    desc: "Group customers by tags, list hygiene, and business use case.",
  },
  {
    icon: Megaphone,
    title: "Launch",
    desc: "Pick recipients, choose approved templates, review cost, and send with confidence.",
  },
  {
    icon: Monitor,
    title: "Operate",
    desc: "Track campaign status, wallet deductions, and team-level execution from one system.",
  },
];

const features = [
  { icon: Megaphone, title: "Bulk Messaging", desc: "Send personalized messages to thousands of customers at once without spam issues." },
  { icon: Bot, title: "Automation", desc: "Set up auto-replies, welcome messages, follow-ups, and reminders—so you never miss a lead." },
  { icon: MessageSquare, title: "Chat Management", desc: "Manage all your WhatsApp conversations from one dashboard, even with multiple team members." },
  { icon: Target, title: "Broadcast Campaigns", desc: "Run targeted campaigns for promotions, offers, updates, and announcements." },
  { icon: Users, title: "Lead Generation", desc: "Capture and nurture leads directly through WhatsApp." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Track message performance, delivery, and engagement to improve results." },
  { icon: ShoppingCart, title: "Shopify-ready foundation", desc: "Structured for store events, order messaging, and future catalog workflows." },
  { icon: Shield, title: "Meta-grade security", desc: "Official Meta onboarding flow with template-led campaign governance." },
];

const integrations = ["Shopify", "Meta", "Shiprocket", "Google Sheets", "Zapier", "WooCommerce", "Calendly", "Pabbly"];

const plans = [
  {
    name: "Starter",
    price: "₹5,000",
    period: "6 months",
    features: ["1 workspace", "Template messaging", "Contacts + CSV import", "Wallet and transactions"],
  },
  {
    name: "Growth",
    price: "₹8,000",
    period: "6 months",
    features: ["Broadcast campaigns", "Advanced dashboard", "Priority support", "Shopify-ready structure"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    features: ["Multiple teams", "API and automation roadmap", "Custom onboarding", "Dedicated success support"],
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">WaBiz</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link to="/partner" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partner</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
            <Button variant="gradient" size="sm" onClick={() => navigate("/signup")}>Get Started</Button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_40%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1.15fr,0.85fr] gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Shield className="h-4 w-4" />
                Direct Meta integration for serious WhatsApp operations
              </div>
              <h1 className="mt-6 text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold tracking-tight text-foreground leading-tight">
                WhatsApp marketing that can
                <span className="text-primary"> help businesses grow faster and manage customers more efficiently</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Everything you need to grow your business: Bulk messaging, automation, chat management, broadcast campaigns, lead generation, and analytics – all in one powerful dashboard.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="gradient" size="lg" onClick={() => navigate("/signup")}>
                  Start Building <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
                  See Product Flow
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {trustSignals.map((signal) => (
                  <div key={signal} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                    {signal}
                  </div>
                ))}
              </div>
              <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative flex justify-center"
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(circle_at_center,hsl(152_58%_38%/0.14),transparent_70%)]" />
              <div className="relative z-10 rounded-[2rem] border border-border bg-card/80 p-6 shadow-elevated backdrop-blur">
                <img src={heroPhone} alt="WaBiz product preview" className="mx-auto w-72 lg:w-80 xl:w-96 drop-shadow-2xl" />
              </div>
              <div className="absolute left-0 top-12 z-20 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
                <p className="text-xs font-semibold text-foreground">Wallet Protected</p>
                <p className="text-[11px] text-muted-foreground">Send blocked on low funds</p>
              </div>
              <div className="absolute right-0 top-1/3 z-20 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
                <p className="text-xs font-semibold text-foreground">Meta Connected</p>
                <p className="text-[11px] text-muted-foreground">Portfolio + number mapped</p>
              </div>
              <div className="absolute left-10 bottom-12 z-20 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
                <p className="text-xs font-semibold text-foreground">Cost Before Send</p>
                <p className="text-[11px] text-muted-foreground">Campaign estimate shown upfront</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="platform" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Built to feel more like a control layer than a bulk sender
            </h2>
            <p className="mt-4 text-muted-foreground">
              After reviewing Serri-style positioning, the stronger direction for WaBiz is a cleaner, more operational product story: onboarding, compliance, wallet governance, templates, and campaign execution in one enterprise-friendly flow.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {enterprisePillars.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-display font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="py-20 gradient-subtle border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              One product, shaped for three business motions
            </h2>
            <p className="mt-4 text-muted-foreground">
              This is the part that makes Serri-style positioning useful for us: sharper category clarity. WaBiz should win by being obviously right for Shopify brands, D2C marketers, and local operators.
            </p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-7 shadow-card"
              >
                <h3 className="text-xl font-display font-semibold text-foreground">{useCase.title}</h3>
                <div className="mt-5 space-y-3">
                  {useCase.points.map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] items-start">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                From Meta connection to campaign send in one operating path
              </h2>
              <p className="mt-4 text-muted-foreground">
                Instead of spreading the story across disconnected features, we now frame WaBiz as an operating system. That’s the more suitable route for your product than looking like a services-heavy catalogue site.
              </p>
            </div>
            <div className="grid gap-4">
              {operatingSystem.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-y border-border gradient-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Enterprise-grade product depth</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                The page now speaks more to platform strength: not just chatbots or broadcasts, but finance controls, workflow safety, and operator visibility.
              </p>
            </div>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-display font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations" className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Ecosystem-ready from day one</h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Built around WhatsApp first, but structured to grow into commerce events, support workflows, and automation rails.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card px-6 py-4 shadow-card"
              >
                <span className="text-sm font-semibold text-foreground">{integration}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 border-y border-border gradient-subtle">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">Transparent pricing with room to scale</h2>
            <p className="mt-4 text-muted-foreground">
              Prepaid wallet logic stays product-native, while larger teams can move to enterprise rollout and integration support.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border bg-card p-8 shadow-card ${plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Best for growing teams
                  </span>
                )}
                <h3 className="text-lg font-display font-bold text-foreground">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-display font-extrabold text-foreground">{plan.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ {plan.period}</span>
                </div>
                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant={plan.popular ? "gradient" : "outline"}
                  className="mt-8 w-full"
                  onClick={() => navigate("/signup")}
                >
                  {plan.price === "Custom" ? "Talk to Sales" : "Get Started"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] gradient-primary px-8 py-12 text-center shadow-elevated lg:px-16 lg:py-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground">
              Build the enterprise version of WhatsApp growth without enterprise complexity
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/85">
              For your product, the more suitable benchmark is the operational clarity of Serri-style positioning, combined with a cleaner SaaS dashboard feel. That’s the direction this landing page now follows.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90 shadow-md" onClick={() => navigate("/signup")}>
                Start Free Trial <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate("/login")}>
                Explore Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">WaBiz</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Sales</a>
            <Link to="/partner" className="hover:text-foreground transition-colors">Partner</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 WaBiz. Built for WhatsApp-first growth teams.</p>
        </div>
      </footer>
    </div>
  );
}
