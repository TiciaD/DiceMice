import { useState } from "react";
import { Box, Card, CardActions, CardContent, CardHeader, Collapse, Container, IconButton, IconButtonProps, styled, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGameData } from "@/context/GameDataContext";

const SkillsView = () => {
  const { skills, stats } = useGameData();
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

  const benefitOrder = ['Trained', 'Expert', 'Master', 'Legendary']

  const handleExpandClick = (skillId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [skillId]: !prevExpanded[skillId], // Toggle only the selected card
    }));
  };

  const getStatName = (statId: string) => {
    const foundStat = stats.find((stat) => stat.id === statId)
    if (foundStat) {
      return foundStat.name
    } else {
      return 'Unknown'
    }
  }

  interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
  }

  const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme }) => ({
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
    variants: [
      {
        props: ({ expand }) => !expand,
        style: {
          transform: 'rotate(0deg)',
        },
      },
      {
        props: ({ expand }) => !!expand,
        style: {
          transform: 'rotate(180deg)',
        },
      },
    ],
  }));

  return (
    <Container sx={{ py: 2 }}>
      <Typography variant="h3" gutterBottom>
        Skills
      </Typography>
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
        {skills.map((skill) => {
          return (
            <Card key={skill.id}>
              <CardHeader
                title={skill.name}
                subheader={`Associated Stat: ${getStatName(skill.associatedStatId)}`}
              />
              <CardContent sx={{ padding: 0, marginLeft: '1rem', marginRight: '1rem' }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {skill.description}
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <ExpandMore
                  expand={!!expanded[skill.id]}
                  onClick={() => handleExpandClick(skill.id)}
                  aria-expanded={!!expanded[skill.id]}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              <Collapse in={!!expanded[skill.id]} timeout="auto" unmountOnExit>
                <CardContent>
                  {benefitOrder.map((key, i) => <Box key={`${key}_${i}`} sx={{ marginBottom: 2 }}>
                    <Grid container spacing={2} columns={{ xs: 6, sm: 10, md: 20 }}>
                      <Grid size={{ xs: 2, sm: 2, md: 2 }}>
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>{key}: </Typography>
                      </Grid>
                      <Grid size={{ xs: 4, sm: 8, md: 18 }}>
                        <Typography variant="subtitle1">
                          {skill.benefits[key.toLowerCase()]}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>)}
                </CardContent>
              </Collapse>
            </Card>
          )
        })}
      </Box>
    </Container>
  );
}

export default SkillsView