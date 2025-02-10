import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  BarChart3, 
  Shield, 
  Settings, 
  Users,
  Star,
  Store,
  CreditCard
} from 'lucide-react';

const Features = () => (
  <section className="py-20 container">
    <div className="text-center mb-16">
      <Badge variant="outline" className="mb-4">Features</Badge>
      <h2 className="text-3xl font-bold mb-4 dark:text-white">Everything you need to succeed</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Powerful tools and integrations to help your business grow in the digital marketplace
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          icon: <Store className="h-6 w-6" />,
          title: "Custom Storefronts",
          description: "Build your unique brand with customizable themes and layouts"
        },
        {
          icon: <CreditCard className="h-6 w-6" />,
          title: "Secure Payments",
          description: "Accept payments globally with top-tier security measures"
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: "Analytics",
          description: "Make data-driven decisions with comprehensive insights"
        }
      ].map((feature, index) => (
        <Card key={index} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
              {feature.icon}
            </div>
            <h3 className="font-semibold mb-2 text-xl dark:text-white">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);

const Stats = () => (
  <section className="py-20 dark:bg-black bg-white">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        {[
          { number: "1K+", label: "Active Stores" },
          { number: "$55k+", label: "Monthly Sales" },
          { number: "99.9%", label: "Uptime" },
          { number: "150+", label: "Countries" }
        ].map((stat, index) => (
          <div key={index}>
            <h3 className="text-4xl font-bold mb-2 dark:text-white">{stat.number}</h3>
            <p className="text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-20 container">
    <div className="text-center mb-16">
      <Badge variant="outline" className="mb-4">Testimonials</Badge>
      <h2 className="text-3xl font-bold mb-4 dark:text-white">Loved by businesses worldwide</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        See what our customers have to say about their experience with our platform
      </p>
    </div>
    
    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          quote: "Butik transformed our online presence. The analytics tools are incredible!",
          author: "Sarah J.",
          role: "Fashion Boutique Owner"
        },
        {
          quote: "The best e-commerce solution we've used. Simple yet powerful.",
          author: "Michael R.",
          role: "Tech Store Manager"
        },
        {
          quote: "Outstanding customer support and feature-rich platform.",
          author: "Lisa M.",
          role: "Artisan Shop Owner"
        }
      ].map((testimonial, index) => (
        <Card key={index} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="mb-4 text-muted-foreground">{testimonial.quote}</p>
            <div>
              <p className="font-semibold dark:text-white">{testimonial.author}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);

const AdditionalSections = () => {
  return (
    <>
      <Features />
      <Stats />
      <Testimonials />
    </>
  );
};

export default AdditionalSections;