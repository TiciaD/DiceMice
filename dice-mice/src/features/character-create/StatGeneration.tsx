interface StatGenerationProps {
  countyId: string;
  onStatsGenerated: (stats: number[]) => void
}

const StatGeneration = ({ countyId, onStatsGenerated }: StatGenerationProps) => {
  return (
    <div>StatGeneration</div>
  )
}

export default StatGeneration