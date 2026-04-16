import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isHydrating, onboardingComplete } = useAppContext();

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/home");
      return;
    }

    navigate(onboardingComplete ? "/dashboard" : "/onboarding");
  }, [isAuthenticated, isHydrating, navigate, onboardingComplete]);

  return null;
};

export default Index;
