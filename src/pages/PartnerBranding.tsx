import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";

export default function PartnerBranding() {
  const { branding, updateBranding } = useAppContext();
  const [brandName, setBrandName] = useState(branding?.brandName || "");
  const [logoUrl, setLogoUrl] = useState(branding?.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(branding?.primaryColor || "#123456");
  const [supportEmail, setSupportEmail] = useState(branding?.supportEmail || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBranding({
        brandName,
        logoUrl,
        primaryColor,
        supportEmail,
      });
      toast({ title: "Branding updated successfully!" });
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "An error occurred while saving your branding settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White-Label Branding</h1>
          <p className="text-muted-foreground mt-2">
            Customize the look and feel of the platform for your referred users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Assets</CardTitle>
            <CardDescription>
              Upload your logo and set your primary brand colors to make the app your own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                placeholder="e.g. MySaaS Chat"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              {logoUrl && (
                <div className="mt-4 p-4 border rounded bg-slate-50 inline-block">
                  <img src={logoUrl} alt="Logo Preview" className="h-12 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primaryColor">Primary HEX Color</Label>
              <Input
                id="primaryColor"
                type="color"
                className="w-16 h-10 p-1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@mysaas.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="mt-4">
              {isSaving ? "Saving..." : "Save Branding"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
