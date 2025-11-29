import { AiInsightCard } from "@/components/ai-insight-card"
import { PortfolioChart } from "@/components/portfolio-chart"
import { PortfolioDistribution } from "@/components/portfolio-distribution"
import { PageLayout } from "@/components/page-layout"
import { FloatingNav } from "@/components/floating-nav"
import { DashboardStats } from "@/components/DashboardStats"

export default function Dashboard() {
  return (
    <>
      <PageLayout>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-white/60">
              Track your portfolio and monitor your vault positions
            </p>
          </div>

          {/* Main Dashboard Stats - User Portfolio */}
          <DashboardStats />

          {/* AI Insights Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">AI Insights</h2>
            <AiInsightCard />
          </div>

          {/* Portfolio Overview */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Value Chart */}
              <div className="lg:col-span-1">
                <PortfolioChart />
              </div>

              {/* Portfolio Distribution */}
              <div className="lg:col-span-1">
                <PortfolioDistribution />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      {/* Floating Navigation */}
      <FloatingNav />
    </>
  )
}
