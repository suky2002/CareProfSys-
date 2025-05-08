import React, { useEffect, useState, useRef } from "react";
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Box,
} from "@mui/material";
import { Canvas, useFrame } from "@react-three/fiber";
import { fetchSkills } from "../utils/skills";

// A simple laptop made from two thin boxes
function Laptop({ width = 3, depth = 2, colorBase = "#555", colorScreen = "#888" }) {
  const ref = useRef();
  useFrame(() => {
    ref.current.rotation.y += 0.005;
  });
  return (
    <group ref={ref}>
      {/* Base */}
      <mesh position={[0, -0.05, 0]}>
        <boxBufferGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={colorBase} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, width * 0.15, -depth / 2 + 0.05]} rotation={[-Math.PI / 4, 0, 0]}>
        <boxBufferGeometry args={[width, width * 0.6, 0.1]} />
        <meshStandardMaterial color={colorScreen} />
      </mesh>
    </group>
  );
}

export default function SkillForm({ onRecommend }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const minSkills = 2;
  const maxSkills = 10;

  useEffect(() => {
    fetchSkills().then(setSkills).catch(console.error);
  }, []);

  const handleSkillChange = (e) => {
    const sel = e.target.value;
    if (sel.length <= maxSkills) setSelectedSkills(sel);
    else alert(`You can select up to ${maxSkills} skills.`);
  };

  const handleRecommendClick = () => {
    if (selectedSkills.length < minSkills) {
      alert(`Please select at least ${minSkills} skills.`);
    } else {
      onRecommend(selectedSkills);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={4}
      flexWrap="wrap"
      p={2}
    >
      {/* Top: Laptop model */}
      <Box width={250} height={200}>
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Laptop />
        </Canvas>
      </Box>

      {/* Skill Selection Form */}
      <Box textAlign="center">
        <h2>
          Please select between {minSkills} and {maxSkills} skills
        </h2>
        <FormControl fullWidth sx={{ maxWidth: 400, mt: 1 }}>
          <InputLabel id="skill-label">Your skills</InputLabel>
          <Select
            labelId="skill-label"
            multiple
            value={selectedSkills}
            onChange={handleSkillChange}
            renderValue={(sel) => sel.join(", ")}
          >
            {skills.map((skill) => (
              <MenuItem key={skill} value={skill}>
                <Checkbox checked={selectedSkills.includes(skill)} />
                <ListItemText primary={skill} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box mt={2}>
          <button onClick={handleRecommendClick}>
            Recommend VR Experience
          </button>
        </Box>
      </Box>
    </Box>
  );
}
