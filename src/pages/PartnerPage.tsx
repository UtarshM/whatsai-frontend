import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Code2,
  DollarSign,
  GitBranch,
  Headphones,
  MessageSquare,
  Megaphone,
  Palette,
  PieChart,
  Send,
  Settings,
  ShoppingCart,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApplyAsPartnerMutation } from "@/hooks/useAppApi";
import type { PartnerType } from "@/lib/api/types";

const partnerStats = [
  { value: "500+", label: "Partners" },
  { value: "50+", label: "Countries" },
  { value: "20Cr+", label: "Revenue Generated" },
  { value: "95%", label: "Partner Retention" },
];

const partnershipModels = [
  {
    icon: Users,
    title: "Affiliate Partner",
    desc: "Earn recurring 20% commission on every referral. Simple referral link, no tech needed.",
    features: ["20% recurring commission", "No technical setup required", "Instant referral tracking"],
  },
  {
    icon: ShoppingCart,
    title: "Reseller Partner",
    desc: "Resell WhatsAppFly plans with custom pricing and margins. Get volume discounts.",
    features: ["Custom pricing control", "Volume-based discounts", "White-glove onboarding"],
  },
  {
    icon: Palette,
    title: "White-Label Partner",
    desc: "Fully branded solution with your domain, logo, colors, and pricing. We handle the backend.",
    features: ["Your brand, our tech", "Custom domain & logo", "Full pricing control"],
  },
  {
    icon: Code2,
    title: "API/Integration Partner",
    desc: "Build on our APIs or integrate WhatsAppFly into your existing platform.",
    features: ["Full API access", "Technical documentation", "Dedicated support"],
  },
];

const partnerBenefits = [
  {
    icon: DollarSign,
    title: "Recurring Monthly Payouts",
    desc: "Earn commissions every month as long as your referrals stay active",
  },
  {
    icon: Headphones,
    title: "Dedicated Partner Support",
    desc: "Personal account manager and priority support channel",
  },
  {
    icon: BarChart3,
    title: "Partner Dashboard",
    desc: "Real-time tracking of referrals, conversions, and earnings",
  },
  {
    icon: Megaphone,
    title: "Marketing Resources",
    desc: "Ready-made collateral, co-branded materials, and campaign templates",
  },
  {
    icon: Zap,
    title: "Priority Feature Access",
    desc: "Early access to new features and beta programs",
  },
  {
    icon: Settings,
    title: "Flexible Commission Structure",
    desc: "Choose the model that works best for your business",
  },
];

const platformFeatures = [
  { icon: Send, title: "Bulk Campaigns", desc: "Send personalized messages to thousands of customers at once" },
  { icon: MessageSquare, title: "Team Inbox", desc: "Manage all WhatsApp conversations from one shared dashboard" },
  { icon: GitBranch, title: "Workflow Automation", desc: "Set up auto-replies, follow-ups, and triggered sequences" },
  { icon: PieChart, title: "Analytics & Reporting", desc: "Track message performance, delivery, and engagement" },
  { icon: UserPlus, title: "Lead Management", desc: "Capture and nurture leads directly through WhatsApp" },
  { icon: ShoppingCart, title: "E-commerce Integration", desc: "Connect with Shopify, WooCommerce, and more" },
];

const howItWorks = [
  { step: "1", title: "Sign Up", desc: "Register as a partner and get approved within 48 hours" },
  { step: "2", title: "Refer & Sell", desc: "Share your referral link or resell plans to clients" },
  { step: "3", title: "Earn", desc: "Get recurring commissions deposited monthly" },
];

const faqItems = [
  {
    question: "How does the commission structure work?",
    answer: "Our commission structure varies by partnership model. Affiliate partners earn 20% recurring commission on all referrals. Reseller partners enjoy volume-based discounts up to 40% on plans. White-label partners get custom pricing with margins up to 50%. All commissions are paid monthly once you reach the minimum threshold of ₹5,000.",
  },
  {
    question: "What support do partners receive?",
    answer: "All partners receive dedicated account management, priority support channel access, comprehensive onboarding training, and regular product updates. Enterprise and white-label partners get additional benefits including technical integration support, custom feature development discussions, and quarterly business reviews.",
  },
  {
    question: "How do I track my referrals and earnings?",
    answer: "You'll have access to a real-time Partner Dashboard that shows your referral links, click-through rates, conversion rates, active customers, and commission earnings. The dashboard includes detailed reports that can be exported and integrates with your preferred analytics tools.",
  },
  {
    question: "Can I white-label WhatsAppFly for my clients?",
    answer: "Yes! Our White-Label Partner program allows you to offer WhatsAppFly under your own brand. You can customize the domain, logo, color scheme, and pricing. We handle all the backend infrastructure, Meta API integration, and technical maintenance while you focus on growing your client base.",
  },
  {
    question: "What is the minimum payout threshold?",
    answer: "The minimum payout threshold is ₹5,000 (approximately $60). Once your earnings exceed this amount, you'll receive payment within the first week of the following month. We support bank transfers, UPI, and PayPal for international partners.",
  },
  {
    question: "How do I get started as a partner?",
    answer: "Getting started is simple: Click the 'Become a Partner' button, fill out our brief application form, and our partner team will review your application within 48 hours. Once approved, you'll receive access to your partner dashboard, marketing resources, and your unique referral links.",
  },
];

export default function PartnerPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [partnerType, setPartnerType] = useState<PartnerType>("affiliate");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const applyMutation = useApplyAsPartnerMutation();

  const resetForm = () => {
    setContactName("");
    setEmail("");
    setPhone("");
    setCompanyName("");
    setPartnerType("affiliate");
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(
      {
        contactName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
        partnerType,
        message: message || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Application submitted!",
            description: "We'll review and get back to you soon.",
          });
          setDialogOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/home" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">WaBiz</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/home#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</Link>
            <Link to="/home#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</Link>
            <Link to="/home#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/partner" className="text-sm text-primary font-medium">Partner</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="gradient" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(205_78%_52%/0.10),transparent_40%),radial-gradient(circle_at_bottom_right,hsl(152_58%_38%/0.10),transparent_45%)]" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Users className="h-4 w-4" />
                Join 500+ partners growing with WhatsAppFly
              </div>
              <h1 className="mt-6 text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold tracking-tight text-foreground leading-tight">
                Grow Your Business as a{" "}
                <span className="text-primary">WhatsAppFly Partner</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                Partner with India's leading WhatsApp marketing platform. Earn recurring commissions, resell with custom pricing, or build your own branded solution on our robust infrastructure.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" size="lg">
                      Become a Partner <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Partner Application</DialogTitle>
                      <DialogDescription>
                        Fill out the form below to apply for our partner program.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input
                          id="contactName"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="partnerType">Partner Type *</Label>
                        <Select value={partnerType} onValueChange={(value) => setPartnerType(value as PartnerType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select partner type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="affiliate">Affiliate Partner</SelectItem>
                            <SelectItem value="reseller">Reseller Partner</SelectItem>
                            <SelectItem value="white_label">White-Label Partner</SelectItem>
                            <SelectItem value="api_integration">API/Integration Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your business"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Link to="/login">
                  <Button variant="outline" size="lg">Book a Demo</Button>
                </Link>
              </div>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {partnerStats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-card">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Choose Your Partnership Model
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you're a consultant, agency, or platform builder, we have a partnership model designed for your business.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {partnershipModels.map((model, index) => (
              <motion.div
                key={model.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <model.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-display font-semibold text-foreground">{model.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{model.desc}</p>
                <ul className="mt-4 space-y-2">
                  {model.features.map((feature) => (
                    <li key={feature} className="text-xs text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <span className="mt-5 text-sm font-medium text-primary/60 cursor-default transition-colors">
                  Learn More →
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="py-20 gradient-subtle border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Why Partner With Us?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We're committed to your success with industry-leading support, tools, and compensation.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partnerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-display font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Sell a Platform Built for Growth
            </h2>
            <p className="mt-4 text-muted-foreground">
              WhatsAppFly offers a comprehensive suite of tools that businesses need to succeed with WhatsApp marketing.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
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

      {/* How It Works */}
      <section className="py-20 border-y border-border gradient-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Getting started as a partner is quick and straightforward.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-display font-bold text-primary-foreground shadow-elevated">
                  {step.step}
                </div>
                <h3 className="mt-5 text-lg font-display font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know about the WhatsAppFly Partner Program.
            </p>
          </div>
          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] gradient-primary px-8 py-12 text-center shadow-elevated lg:px-16 lg:py-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground">
              Ready to Grow Together?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-primary-foreground/85">
              Join our partner network and start earning recurring revenue while helping businesses succeed with WhatsApp marketing.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                className="bg-card text-foreground hover:bg-card/90 shadow-md"
                onClick={() => setDialogOpen(true)}
              >
                Become a Partner <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
          </div>
          <p className="text-xs text-muted-foreground">© 2026 WaBiz. Built for WhatsApp-first growth teams.</p>
        </div>
      </footer>
    </div>
  );
}
