import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  totalEventosAno: number;
  proximoEventoNome: string;
  proximoEventoData: string;
  totalEventosFuturos: number;
  ultimoEventoNome: string;
  ultimoEventoData: string;
  ultimoEventoCriadoEm: string;
}

export function SectionCards({
  totalEventosAno,
  proximoEventoNome,
  proximoEventoData,
  totalEventosFuturos,
  ultimoEventoNome,
  ultimoEventoData,
  ultimoEventoCriadoEm
}: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* QTD eventos no ano */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Eventos Criados</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {totalEventosAno} eventos
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            No ano de 2025
          </div>
        </CardFooter>
      </Card>

      {/* Próximo evento */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Próximo evento</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {proximoEventoNome || "Nenhum evento"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">
            {proximoEventoData || "--"}
          </div>
          <div className="text-muted-foreground">
            Fique atento!
          </div>
        </CardFooter>
      </Card>

      {/* Eventos futuros */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Eventos ainda neste ano</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {totalEventosFuturos} eventos
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Último evento criado */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Último evento criado</CardDescription>
          <CardTitle className="text-2xl font-semibold">
            {ultimoEventoNome}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">
            Data do Evento: {ultimoEventoData}
          </div>
          <div className="text-muted-foreground">
            Criado em {ultimoEventoCriadoEm}
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
