import { useCharacterEditContext } from "@/context/CharacterEditContext";
import { useUser } from "@/context/UserDataProvider";
import { PlayerHouse } from "@/models/player-house.model";
import { fetchCharacterById, getHouseByPlayerId } from "@/services/firestore-service";
import { Box, Button, CircularProgress, Container, Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import { useGameData } from "@/context/GameDataContext";
import EditNameDialogForm from "@/components/edit-character-form/EditNameDialogForm";
import { AllowedStats, Character } from "@/models/character.model";
import EditCountyDialogForm from "@/components/edit-character-form/EditCountyDialogForm";
import EditClassDialogForm from "@/components/edit-character-form/EditClassDialogForm";
import EditLevelDialogForm from "@/components/edit-character-form/EditLevelDialogForm";
import StatSheet from "@/components/StatSheet";
import CloseIcon from '@mui/icons-material/Close';
import EditHPDialogForm from "@/components/edit-character-form/EditHPDialogForm";
import EditStatsDialogForm from "@/components/edit-character-form/EditStatsDialogForm";
import EditSkillsDialogForm from "@/components/edit-character-form/EditSkillsDialogForm";


const CharacterView = () => {
  const { characterId } = useParams();
  const { counties, classes, stats, skills } = useGameData();
  const {
    isLoading,
    setIsLoading,
    currentCharacter,
    setCurrentCharacter,
    skillLevels,
    derivedStats,
    initiativeChart,
    fetchData
  } = useCharacterEditContext()
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, house, loading } = useUser();
  const navigate = useNavigate();
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editField, setEditField] = useState<null | 'name' | 'county' | 'class' | 'level' | 'hp' | 'stats' | 'skills' | 'sheet'>(null);
  const isCharacterBelongsToHouse = currentCharacter?.houseId === currentHouse?.id

  useEffect(() => {
    setIsLoading(true)
    console.log("current house", currentHouse)

    if (characterId) {
      fetchCharacter()
      fetchData()
    }

    if (!house) {
      fetchHouse();
    } else {
      setCurrentHouse(house);
    }

    setIsLoading(false)
  }, [user, house]);

  const fetchHouse = async () => {
    if (user) {
      const house = await getHouseByPlayerId(user.id);
      console.log("house", house)
      setCurrentHouse(house); // `house` will be null if not found
    }

  };

  const fetchCharacter = async () => {
    if (characterId) {
      const character = await fetchCharacterById(characterId)
      console.log("found character", character)
      setCurrentCharacter(character)
    }
  }

  const getCountyName = (countyId: string) => {
    const county = counties.find(c => c.id === countyId);
    return county?.name ?? "No County Found."
  }

  const getClassName = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass?.name ?? "No Class Found."
  }

  const getStatName = (statId: string) => {
    const foundStat = stats.find(s => s.id === statId);
    return foundStat?.name ?? "No Stat Found."
  }

  const getSkillName = (skillId: string) => {
    const foundSkill = skills.find(s => s.id === skillId);
    return foundSkill?.name ?? "No Skill Found."
  }

  const getSkillLevelName = (skillLevelId: string) => {
    const foundSkillLevel = skillLevels.find(s => s.id === skillLevelId);
    return foundSkillLevel?.name ?? "No Skill Level Found."
  }

  const getHP = () => {
    let totalHP = 0;
    if (currentCharacter) {
      Object.values(currentCharacter.hp_progression).forEach((hitPoints) => {
        totalHP += hitPoints
      })
    }
    return totalHP
  }

  const handleOpenEdit = (field: typeof editField) => {
    setEditField(field);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    fetchCharacter()
    setOpenDialog(false)
  };

  const handleCloseWithoutRefetch = () => setOpenDialog(false)

  const renderDialogContent = (currentCharacter: Character) => {
    const currentClass = classes.find((cls) => cls.id === currentCharacter.classId)

    switch (editField) {
      case "name":
        return (
          <>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogContent>
              <EditNameDialogForm characterId={currentCharacter.id} defaultValue={currentCharacter.name} handleClose={handleCloseDialog} />
            </DialogContent>
          </>
        );
      case "county":
        return (
          <>
            <DialogTitle>Edit Origin County</DialogTitle>
            <DialogContent>
              <EditCountyDialogForm characterId={currentCharacter.id} counties={counties} defaultValue={currentCharacter.countyId} handleClose={handleCloseDialog} />
            </DialogContent>
          </>
        );
      case "class":
        const filteredClasses = classes.filter(cls => {
          return cls.prerequisites.every(req => currentCharacter.current_base_stats[req.stat as AllowedStats] >= req.min);
        });
        return (
          <>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogContent>
              <EditClassDialogForm eligibleClasses={filteredClasses} characterId={currentCharacter.id} defaultValue={currentCharacter.classId} handleClose={handleCloseDialog} />
            </DialogContent>
          </>
        );
      case "level":
        return (
          <>
            <DialogTitle>Edit Level</DialogTitle>
            <DialogContent>
              <EditLevelDialogForm characterId={currentCharacter.id} defaultValue={currentCharacter.level.toString()} handleClose={handleCloseDialog} />
            </DialogContent>
          </>
        );
      case "hp":
        return (
          <>
            <DialogTitle>Edit HP By Level</DialogTitle>
            <DialogContent>
              <EditHPDialogForm character={currentCharacter} classes={classes} handleClose={handleCloseDialog} />
            </DialogContent>
          </>
        );
      case "stats":

        return (
          <>
            <DialogTitle>Edit Stats</DialogTitle>
            <DialogContent>
              {currentClass && <EditStatsDialogForm character={currentCharacter} stats={stats} currentClass={currentClass} handleClose={handleCloseDialog} />}
            </DialogContent>
          </>
        );
      case "skills":
        return (
          <>
            <DialogTitle>Edit Skills</DialogTitle>
            <DialogContent>
              {currentClass && <EditSkillsDialogForm isMobile={isMobile} character={currentCharacter} stats={stats} skills={skills} skillLevels={skillLevels} currentClass={currentClass} handleClose={handleCloseDialog} />}
            </DialogContent>
          </>
        );
      default:
        const offensiveStats = derivedStats.filter((stat) => stat.type === "NON-CALCULATED")
        const defensiveStats = derivedStats.filter(stat => stat.type === "DEFENSE")

        return (
          <>
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              {currentCharacter.name} Stats
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleCloseWithoutRefetch}
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <StatSheet
                character={currentCharacter}
                initiativeChart={initiativeChart}
                offensiveStats={offensiveStats}
                defensiveStats={defensiveStats}
                skillLevels={skillLevels} />
            </DialogContent>
          </>
        );
    }
  };

  return (
    <Container>
      {currentCharacter && !loading ?
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h4">Edit Character</Typography>
          <Button variant="outlined" onClick={() => handleOpenEdit('sheet')}>View Stat Sheet</Button>
          {/* <CharacterSheet character={currentCharacter} /> */}
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Name:</b> {currentCharacter.name}</Typography>
            <IconButton aria-label="edit name" color="primary" onClick={() => handleOpenEdit('name')}>
              <EditIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Origin County:</b> {getCountyName(currentCharacter.countyId)}</Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit county" color="primary" onClick={() => handleOpenEdit('county')}>
              <EditIcon />
            </IconButton>}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Class:</b> {getClassName(currentCharacter.classId)}</Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit class" color="primary" onClick={() => handleOpenEdit('class')}>
              <EditIcon />
            </IconButton>}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Level:</b> {currentCharacter.level}</Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit level" color="primary" onClick={() => handleOpenEdit('level')}>
              <EditIcon />
            </IconButton>}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>HP:</b> {getHP()}</Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit level" color="primary" onClick={() => handleOpenEdit('hp')}>
              <EditIcon />
            </IconButton>}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Current Stats:</b></Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit stats" color="primary" onClick={() => handleOpenEdit('stats')}>
              <EditIcon />
            </IconButton>}
          </Box>
          <Box sx={{ pl: 2, pb: 2 }}>
            {Object.entries(currentCharacter.current_base_stats).map(([key, value]) => {

              return (
                <Typography key={key} variant='body1'>{getStatName(key)}: {value}</Typography>
              )
            })}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Typography variant="h5"><b>Current Skills:</b></Typography>
            {isCharacterBelongsToHouse && <IconButton aria-label="edit level" color="primary" onClick={() => handleOpenEdit('skills')}>
              <EditIcon />
            </IconButton>}
          </Box>
          {currentCharacter.skills.length > 0 ? <Box sx={{ pl: 2, pb: 2 }}>
            {Object.values(currentCharacter.skills).map((value) => {

              return (
                <Typography key={value.skillId} variant='body1'>{getSkillName(value.skillId)}: {getSkillLevelName(value.skillLevelId)}</Typography>
              )
            })}
          </Box>
            :
            <Typography variant='body1'>No Skills Selected</Typography>}

          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth fullScreen={editField == 'sheet'}>
            {renderDialogContent(currentCharacter)}
          </Dialog>
        </Box>
        :
        <Typography variant="h4">No character found</Typography>

      }
      {(loading || isLoading) && <CircularProgress />}
      <Button variant="contained" onClick={() => navigate("/")}>
        Back to Home
      </Button>
    </Container>
  );
}

export default CharacterView