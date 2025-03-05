import { useGameData } from "@/context/GameDataContext";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";

const CountiesView = () => {
  const { counties, stats } = useGameData();

  const getStatName = (statId: string) => {
    const foundStat = stats.find((stat) => stat.id === statId)
    if (foundStat) {
      return foundStat.name
    } else {
      return 'Unknown'
    }
  }

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h3" gutterBottom>
        Counties
      </Typography>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
        {counties.length > 0 && counties.map((county) => {
          return (
            <Card variant="outlined" key={county.id}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {county.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }} gutterBottom>
                  {county.description}
                </Typography>
                <Box sx={{ display: 'flex', mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mr: 1 }}>
                    Associated Stat:
                  </Typography>
                  <Typography variant="subtitle1">
                    {getStatName(county.associatedStatId)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mr: 1 }}>
                    Associated Skills:
                  </Typography>
                  <Typography variant="subtitle1">
                    {county.associatedSkills.join(', ')}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>
      {counties.length == 0 && (
        <Box>
          <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>No counties found.</Typography>
        </Box>
      )}
    </Container>
  )
}

export default CountiesView