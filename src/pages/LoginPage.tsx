import { Button } from "@/components/ui/button";
import { MessageSquare, Chrome } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/use-toast";
import { activeApiAdapter } from "@/lib/api";
import { hasSupabaseEnv } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/auth";
import { getAuthErrorMessage } from "@/lib/authErrors";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAppContext();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Missing details", description: "Enter your email and password to continue." });
      return;
    }

    setIsSubmitting(true);

    try {
      const nextState = await signIn(email.trim(), password);
      toast({ title: "Signed in", description: "Your workspace is ready." });
      navigate(nextState.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast({
        title: "Login failed",
        description: getAuthErrorMessage(error, "We could not sign you in right now."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    try {
      if (activeApiAdapter === "supabase" && hasSupabaseEnv) {
        await signInWithGoogle();
        return;
      }

      const nextState = await signIn("founder@wabiz.app", "demo-password");
      toast({ title: "Signed in with Google", description: "Demo account connected successfully." });
      navigate(nextState.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch (error) {
      toast({
        title: "Google login failed",
        description: getAuthErrorMessage(error, "We could not start Google login right now."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex gradient-subtle">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-8">
            <MessageSquare className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary-foreground mb-4">
            WhatsApp Business, Simplified.
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Send marketing campaigns, manage contacts, and grow your business with WhatsApp — all from one dashboard.
          </p>
        </motion.div>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">WaBiz</h1>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <div className="space-y-4">
            <Button variant="outline" size="lg" className="w-full justify-center gap-2" onClick={handleGoogleLogin} disabled={isSubmitting}>
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 px-4 rounded-lg border border-input bg-background text-sm"
              />
            </div>

            <Button variant="gradient" size="lg" className="w-full" onClick={handleLogin} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="text-primary font-medium hover:underline">
              Sign up
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
