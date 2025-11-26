"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useNotificationStats } from "@/app/hooks/useChartData"



export const description = "Gráfico interativo de área"

// CONFIG DO GRÁFICO AGORA COM SENT / FAILED
const chartConfig = {
  sent: { label: "Enviadas", color: "var(--primary)" },
  failed: { label: "Falhas", color: "var(--destructive)" },
} satisfies ChartConfig

export function ChartAreaInteractive({ userId }: { userId: string }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  

  // Hook buscando no backend:
  const { data, loading } = useNotificationStats(userId, timeRange)

  // Adaptação automática no mobile
  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  if (loading) {
    return (
      <Card className="@container/card p-6 text-center">
        Carregando gráfico...
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Notificações Disparadas</CardTitle>

        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Estatísticas dos últimos meses
          </span>
          <span className="@[540px]/card:hidden">
            Últimos meses
          </span>
        </CardDescription>

        <CardAction>
          {/* Toggle desktop */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">30 dias</ToggleGroupItem>
            <ToggleGroupItem value="7d">7 dias</ToggleGroupItem>
          </ToggleGroup>

          {/* Select mobile */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden"
              size="sm"
              aria-label="Selecione um período"
            >
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">3 meses</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              {/* Área de ENVIADAS */}
              <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sent)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-sent)" stopOpacity={0.1} />
              </linearGradient>

              {/* Área de FALHAS */}
              <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            {/* Eixo X formatado */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            {/* LINHAS DO BACKEND */}
            <Area
              dataKey="sent"
              type="natural"
              fill="url(#fillSent)"
              stroke="var(--color-sent)"
              stackId="a"
            />

            <Area
              dataKey="failed"
              type="natural"
              fill="url(#fillFailed)"
              stroke="var(--color-failed)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
