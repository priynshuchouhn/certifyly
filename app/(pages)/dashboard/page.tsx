'use client'
import { StatCard } from "@/components/StatCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, FileText, FileUp, Users } from "lucide-react"
import { useRouter } from "next/navigation";

function Dashboard() {
    const router = useRouter();
  return (
    <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your certificate generation platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Templates"
            value="0"
            icon={FileText}
            trend="+0 this month"
          />
          <StatCard
            title="Certificates Generated"
            value="0"
            icon={Award}
            trend="+0 this week"
          />
          <StatCard
            title="Active Recipients"
            value="0"
            icon={Users}
            trend="+0 this month"
          />
          <StatCard
            title="Success Rate"
            value="0%"
            icon={FileUp}
            trend="+0.0% from last month"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with creating certificates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                size="lg"
                onClick={() => router.push("/upload-template")}
              >
                <FileUp className="w-5 h-5 mr-2" />
                Upload New Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => router.push("/upload-data")}
              >
                <FileText className="w-5 h-5 mr-2" />
                Upload Recipient Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="lg"
                onClick={() => router.push("/certificates")}
              >
                <Award className="w-5 h-5 mr-2" />
                View All Certificates
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest certificate generations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Workshop Completion Certificate", count: 45, time: "2 hours ago" },
                  { name: "Course Certificate Template", count: 120, time: "1 day ago" },
                  { name: "Achievement Award", count: 78, time: "3 days ago" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.count} certificates generated</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

export default Dashboard
