import { useEffect, useState } from "react";
import { PlayerHouse } from "@/models/player-house.model";
import { getHouseByPlayerId } from "@/services/firestore-service";
import { useUser } from "@/context/UserDataProvider";
import { useCharacterCreateContext } from "@/context/CharacterSheetContext";
import { Alert, Box, Button, CircularProgress, Container, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import BaseStats from "@/components/BaseStats";
import { useMediaQuery, useTheme } from "@mui/material";

import ClassAndLevelSelect from "@/components/ClassAndLevelSelect";
import OffensiveStatTable from "@/components/OffensiveStatTable";
import DefensiveStatTable from "@/components/DefensiveStatTable";
import SkillsTable from "@/components/SkillsTable";
import FinalizeCharacter from "@/components/FinalizeCharacter";
import HitPointProgression from "@/components/HitPointProgression";



const CreateCharacter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { loading, user, house } = useUser();
  const { isLoading, fetchData } = useCharacterCreateContext()

  const [isHouseLoading, setIsHouseLoading] = useState(false)
  const [currentHouse, setCurrentHouse] = useState<PlayerHouse | null>(null)
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: "County Selection & Base Stats Generation", component: <BaseStats /> },
    { label: "Class & Level Selection", component: <ClassAndLevelSelect /> },
    {
      label: "Offensive & Defensive Stats Review", component: <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
        <OffensiveStatTable />
        <DefensiveStatTable />
      </Box>
    },
    { label: "Set HP By Level", component: <HitPointProgression /> },
    { label: "Optional: Skills Selection", component: <SkillsTable /> },
    { label: "Finalize Character", component: <FinalizeCharacter /> }
  ];

  useEffect(() => {
    console.log("isMobile?", isMobile)
    console.log("started", house)
    const fetchHouse = async () => {
      setIsHouseLoading(true)
      if (user) {
        const house = await getHouseByPlayerId(user.id);
        console.log("house", house)
        fetchData()
        setCurrentHouse(house); // `house` will be null if not found
      }
      setIsHouseLoading(false)
    };

    if (!house) {
      fetchHouse();
    } else {
      fetchData()
      setCurrentHouse(house)
    }
  }, [user, house]);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Container sx={{ paddingTop: 1 }}>
      {
        currentHouse && !loading && !isHouseLoading && !isLoading &&
        <Box sx={{ width: { xs: 'auto', md: '100%' } }}>
          <Typography variant="h5" gutterBottom> New Mouse for House {currentHouse.name}</Typography>
          <Alert severity="warning" sx={{ marginBottom: 2 }}>Changing County will reset all stats. Changing Class/Level will reset skills.</Alert>
          {isMobile ? (
            // Mobile: Vertical Stepper
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    {steps[activeStep].label === "Optional: Skills Selection" ? (
                      <SkillsTable isMobile={isMobile} />
                    ) : (
                      step.component
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      {index < steps.length - 1 && (
                        <Button variant="contained" onClick={handleNext}>
                          Next
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          ) : (
            // Desktop: Horizontal Stepper
            <>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Content below horizontal stepper */}
              <Box sx={{ mt: 2 }}>
                {steps[activeStep].label === "Skills Selection" ? (
                  <Box>
                    <Typography variant="subtitle1">You have finished. Submit character</Typography>
                  </Box>
                ) : (
                  steps[activeStep].component
                )}
                {/* {steps[activeStep].component} */}
                <Box sx={{ mt: 2 }}>
                  <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                  {activeStep < steps.length - 1 && (
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      }
      {
        !currentHouse && !loading && !isHouseLoading && !isLoading &&
        <Box>
          <Typography variant="h5"> No House Found.</Typography>
        </Box>
      }

      {isLoading || isHouseLoading || loading && <CircularProgress />}
    </Container>
  )
}

export default CreateCharacter