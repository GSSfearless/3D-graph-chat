import '../styles/we-are-hiring.css';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function HiringPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center">
      <header className="w-full px-4 lg:px-6 h-14 flex items-center justify-center">
        <div className="container max-w-6xl flex items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <Brain className="h-6 w-6" />
            <span className="sr-only">AI Startup Logo</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              About
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              Careers
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center w-full">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Join the AI Revolution
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  We&apos;re on a mission to create world-changing AI applications. Are you ready to help us build the next killer app that will revolutionize industries?
                </p>
              </div>
              <div className="space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => scrollToSection('open-positions')}>
                  View Open Positions
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section id="open-positions" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-6xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Open Positions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <JobCard
                title="Visionary Hacker"
                description="Seeking out-of-the-box thinkers to create revolutionary technologies."
                location="Global Remote"
              />
              <JobCard
                title="Future Rocket Engineer"
                description="Design next-gen interstellar travel tech to make humans a multi-planetary species."
                location="Mars Base"
              />
              <JobCard
                title="Quantum Computing Pioneer"
                description="Explore the mysteries of the quantum realm and develop disruptive computing technologies."
                location="Quantum Lab"
              />
              <JobCard
                title="AI Philosopher"
                description="Contemplate the ethics and existential questions of AI to shape the future of human-machine coexistence."
                location="Virtual Reality Space"
              />
              <JobCard
                title="Black Hole Scientist"
                description="Unravel the mysteries of black holes and push the boundaries of astrophysics."
                location="Event Horizon Observatory"
              />
              <JobCard
                title="Mad Scientist of Creativity"
                description="Transform crazy ideas into reality, challenging the limits of science."
                location="Secret Laboratory"
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6 max-w-4xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join Our Talent Network
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Stay updated on new opportunities and be the first to know about exciting roles at our AI startup.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input placeholder="Enter your email" type="email" className="flex-grow" />
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full flex flex-col gap-2 sm:flex-row py-6 shrink-0 items-center justify-center px-4 md:px-6 border-t">
        <div className="container max-w-6xl flex flex-col sm:flex-row items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Think Graph Inc. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

function JobCard({ title, description, location }: { title: string; description: string; location: string }) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <Button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => scrollToSection('talent-network')}>
          Apply Now
        </Button>
      </CardContent>
    </Card>
  )
}