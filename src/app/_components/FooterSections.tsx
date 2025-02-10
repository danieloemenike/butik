"use client";
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2,
  Mail,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Github
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const Pricing = () => {
    const router = useRouter();
    return (
  <section className="py-20 container">
    <div className="text-center mb-16">
      <Badge variant="outline" className="mb-4">Pricing</Badge>
      <h2 className="text-3xl font-bold mb-4 dark:text-white">Simple, transparent pricing</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Choose the perfect plan for your business needs
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          name: "Starter",
          price: "$0",
          description: "Perfect for small businesses starting their journey",
          features: ["Up to 100 products", "Basic analytics", "24/7 support", "2% transaction fee"]
        },
        {
          name: "Growth",
          price: "$79",
          description: "Ideal for growing businesses with more needs",
          features: ["Unlimited products", "Advanced analytics", "Priority support", "1% transaction fee"]
        },
        {
          name: "Enterprise",
          price: "Custom",
          description: "For large businesses with custom requirements",
          features: ["Custom solutions", "Dedicated support", "Custom integrations", "Custom pricing"]
        }
      ].map((plan, index) => (
        <Card key={index} className={`group hover:shadow-lg transition-shadow ${index === 1 ? 'border-primary' : ''}`}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 text-2xl dark:text-white">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold dark:text-white">{plan.price}</span>
              {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
            </div>
            <p className="text-muted-foreground mb-6">{plan.description}</p>
            <Button className="w-full mb-6" onClick={() => router.push("/api/auth/register")}>Get Started</Button>
            <ul className="space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
)};

const CTASection = () => {
    const router = useRouter();
    return(
  <section className="py-20">
    <div className="container text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
      <p className=" mb-8 max-w-2xl mx-auto">
        Join thousands of successful businesses using Butik to power their online stores
      </p>
            <Button variant="secondary" size="lg" className="gap-2" onClick={ () => router.push("/api/auth/register") }>
        Get Started Now
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  </section>
)};

const Footer = () => (
    <footer className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-800 via-black to-black text-slate-300">
      <div className="container py-20">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white mb-4">Butik</h4>
            <p className="text-slate-300">
              Empowering businesses to thrive in the digital marketplace
            </p>
            <div className="flex gap-4">
              {[Twitter, Facebook, Instagram, Youtube, Github].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="hover:text-white transition-colors"
                  aria-label="Social Media"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Integrations", "Enterprise", "Security"]
            },
            {
              title: "Resources",
              links: ["Documentation", "Guides", "API Reference", "Blog", "Status"]
            },
            {
              title: "Company",
              links: ["About", "Customers", "Careers", "Contact", "Partners"]
            }
          ].map((column, index) => (
            <div key={index}>
              <h4 className="text-lg font-bold text-white mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a 
                      href="#" 
                      className="text-slate-300 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-slate-700 text-slate-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2025 Butik. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
  


const FooterSections = () => {
  return (
    <>
      <Pricing />
      <CTASection />
      <Footer />
    </>
  );
};

export default FooterSections;