import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Brain, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function HiringPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Brain className="h-6 w-6 text-primary" />
          <span className="sr-only">AI Startup Logo</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#">
            Careers
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Join the AI Revolution
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  We&apos;re building the future of artificial intelligence. Are you ready to be part of something extraordinary?
                </p>
              </div>
              <div className="space-x-4">
                <Button>View Open Positions</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
              Open Positions
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <JobCard
                title="AI Research Scientist"
                description="Push the boundaries of AI and machine learning in our cutting-edge research team."
                location="San Francisco, CA"
              />
              <JobCard
                title="Full Stack Developer"
                description="Build the infrastructure that powers our AI solutions and client-facing applications."
                location="Remote"
              />
              <JobCard
                title="Product Manager"
                description="Shape the future of AI products and drive innovation in the field."
                location="New York, NY"
              />
              <JobCard
                title="Data Engineer"
                description="Design and implement scalable data pipelines to fuel our AI models."
                location="Boston, MA"
              />
              <JobCard
                title="UX/UI Designer"
                description="Create intuitive and engaging user experiences for our AI-powered applications."
                location="Remote"
              />
              <JobCard
                title="AI Ethics Specialist"
                description="Ensure our AI development aligns with ethical standards and societal values."
                location="Washington, D.C."
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Join Our Talent Network
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Stay updated on new opportunities and be the first to know about exciting roles at our AI startup.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input placeholder="Enter your email" type="email" />
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center">
            <p className="text-xs text-muted-foreground">
              © 2023 AI Startup Inc. All rights reserved.
            </p>
            <nav className="sm:ml-auto flex gap-4 sm:gap-6">
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Terms of Service
              </Link>
              <Link className="text-xs hover:underline underline-offset-4" href="#">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

function JobCard({ title, description, location }: { title: string; description: string; location: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <Button className="mt-4 w-full">Apply Now</Button>
      </CardContent>
    </Card>
  )
}