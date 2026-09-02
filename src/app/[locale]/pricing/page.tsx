"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    currency: "EUR",
    interval: "month",
    features: [
      "Access to public projects",
      "Basic support",
      "Community access",
      "Up to 3 API requests per day"
    ],
    limitations: [
      "Limited features",
      "No priority support",
      "No advanced analytics"
    ],
    popular: false,
    buttonText: "Get Started Free",
    stripePriceId: null
  },
  {
    id: "starter",
    name: "Starter",
    description: "Best for individuals",
    price: 9,
    currency: "EUR",
    interval: "month",
    features: [
      "Everything in Free",
      "Access to premium projects",
      "Priority support",
      "Up to 100 API requests per day",
      "Advanced analytics",
      "Export capabilities"
    ],
    limitations: [],
    popular: true,
    buttonText: "Start Free Trial",
    stripePriceId: "price_starter_monthly"
  },
  {
    id: "pro",
    name: "Professional",
    description: "Best for small teams",
    price: 29,
    currency: "EUR",
    interval: "month",
    features: [
      "Everything in Starter",
      "Unlimited API requests",
      "Team collaboration",
      "Custom integrations",
      "Advanced reporting",
      "Priority phone support",
      "Custom branding"
    ],
    limitations: [],
    popular: false,
    buttonText: "Upgrade to Pro",
    stripePriceId: "price_pro_monthly"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Best for large organizations",
    price: 99,
    currency: "EUR",
    interval: "month",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom development",
      "SLA guarantee",
      "On-premise deployment",
      "Advanced security",
      "Training & onboarding"
    ],
    limitations: [],
    popular: false,
    buttonText: "Contact Sales",
    stripePriceId: "price_enterprise_monthly"
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSubscribe = async (planId: string, stripePriceId: string | null) => {
    if (planId === "free") {
      // Redirect to sign up
      window.location.href = "/auth/signin";
      return;
    }

    if (planId === "enterprise") {
      // Redirect to contact
      window.location.href = "/contact";
      return;
    }

    if (!stripePriceId) return;

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          mode: "subscription",
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price === 0) return "Free";
    const price = isAnnual ? plan.price * 10 : plan.price; // 2 months free on annual
    return `€${price}`;
  };

  return (
    <div>
      <PublicLayout>

      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">Pricing</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose the perfect <span className="kb-gradient-text">plan for you</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Start free and scale as you grow. All plans include our core features with different limits and support levels.
            </p>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-y-0 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative border-white/10 bg-white/[0.03] text-slate-100 backdrop-blur-sm ${plan.popular ? "border-indigo-400/60 ring-2 ring-indigo-400/40" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">
                        {getPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm font-medium text-slate-500">
                          /{plan.interval}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-4 w-4 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={`w-full rounded-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:from-blue-400 hover:to-purple-400"
                          : "border-indigo-400/40 bg-transparent text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.id, plan.stripePriceId)}
                    >
                      {plan.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-slate-500">
              All plans include a 14-day free trial. No credit card required to start.{" "}
              <Link href="/contact" className="text-indigo-300 hover:text-indigo-200">
                Questions? Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>

      </PublicLayout>
    </div>
  );
}