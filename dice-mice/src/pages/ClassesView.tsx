import { useEffect, useState } from "react";
import { Box, Card, CardContent, CircularProgress, Container, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGameData } from "@/context/GameDataContext";
import { Class } from "@/models/class.model";
// import { ExpandMore } from "@mui/icons-material";

const ClassesView = () => {
  const { classes, skills } = useGameData();
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);

  useEffect(() => {
    setFilteredClasses(classes)
  }, [classes])

  const handleInputChange = (e: any) => {
    const searchInput = e.target.value;
    setSearchTerm(searchInput)
  }

  const handleSearch = (e: any) => {
    e.preventDefault()
    if (!searchTerm) {
      setFilteredClasses(classes)
      return
    }
    setIsLoading(true);

    const filteredItems = classes.filter((cls) => {
      let isMatchingAbility = false;
      let isMatchingSkill = false;

      // Check if search term matches class name
      if (cls.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return cls;
      }

      // Check if search term matches ability description
      cls.abilities.forEach((ability) => {
        if (ability.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          isMatchingAbility = true;
          return
        }
      })

      // Check if search term matches a skill name
      cls.skillIds.forEach((skill) => {
        const skillNameWithoutUnderscores = skill.replace('_', ' ')
        if (skillNameWithoutUnderscores.includes(searchTerm.toLowerCase())) {
          isMatchingSkill = true;
          return
        }
      })

      if (isMatchingAbility || isMatchingSkill) {
        return cls;
      }
    }
    );

    setFilteredClasses(filteredItems);
    setIsLoading(false);
  }

  const getSkillName = (skillId: string) => {
    return skills.find((skill) => skill.id == skillId)?.name ?? 'Unknown'
  }

  return (
    <Container sx={{ pt: 2 }}>
      <Typography variant="h3" gutterBottom>
        Classes
      </Typography>
      <form onSubmit={handleSearch}>
        <FormControl sx={{ width: '25ch', pb: 1 }} variant="outlined" >
          <InputLabel htmlFor="search-bar">Search Classes</InputLabel>
          <OutlinedInput
            id="search-bar"
            type="search"
            value={searchTerm}
            onChange={handleInputChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
            label="Search Classes"
          />
        </FormControl>
      </form>
      {isLoading && <CircularProgress />}
      <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
        {!isLoading && filteredClasses.length > 0 && filteredClasses.map((cls) => {
          return (
            <Card variant="outlined" key={cls.id}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {cls.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }} gutterBottom>
                  {cls.description}
                </Typography>
                <Box sx={{ display: 'flex', mb: 1.5, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mr: 1 }}>
                    Skills:
                  </Typography>
                  <Typography variant="subtitle1">
                    {cls.skillIds.map((skillId) => getSkillName(skillId)).join(', ')}
                  </Typography>
                </Box>
              </CardContent>
              {/* <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <FavoriteIcon />
                </IconButton>
                <ExpandMore
                  expand={expanded}
                  onClick={handleExpandClick}
                  aria-expanded={expanded}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions> */}
            </Card>
          )
        })}
      </Box>
      {!isLoading && filteredClasses.length == 0 && (
        <Box>
          <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>No classes found matching the given filter.</Typography>
        </Box>
      )}
    </Container>
  )
}

export default ClassesView