import { Student, GroupResult, GroupingMode, NamingType } from '../types';

// Fisher-Yates Shuffle Algorithm
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const generateGroups = (
  students: Student[],
  mode: GroupingMode,
  value: number,
  namingPattern: string,
  customNames: string[] = [],
  namingType: NamingType = 'auto'
): GroupResult[] => {
  const shuffledStudents = shuffleArray(students);
  const totalStudents = shuffledStudents.length;
  const groups: GroupResult[] = [];
  const baseName = namingPattern.trim() || 'Kelompok';

  if (totalStudents === 0) return [];

  if (mode === GroupingMode.BY_COUNT) {
    const numGroups = Math.max(1, Math.min(value, totalStudents));
    
    // Initialize groups
    for (let i = 0; i < numGroups; i++) {
      let groupName = `${baseName} ${i + 1}`;
      
      // Use custom name if available and type is custom
      if (namingType === 'custom' && customNames[i]) {
        groupName = customNames[i];
      }

      groups.push({
        id: `g-${i}`,
        name: groupName,
        members: [],
      });
    }

    // Distribute students
    shuffledStudents.forEach((student, index) => {
      const groupIndex = index % numGroups;
      groups[groupIndex].members.push(student);
    });

  } else if (mode === GroupingMode.BY_SIZE) {
    const groupSize = Math.max(1, value);
    const numGroups = Math.ceil(totalStudents / groupSize);

    for (let i = 0; i < numGroups; i++) {
      let groupName = `${baseName} ${i + 1}`;

      // Use custom name if available and type is custom
      if (namingType === 'custom' && customNames[i]) {
        groupName = customNames[i];
      }

      const startIdx = i * groupSize;
      const endIdx = startIdx + groupSize;
      const members = shuffledStudents.slice(startIdx, endIdx);

      groups.push({
        id: `g-${i}`,
        name: groupName,
        members,
      });
    }
  }

  return groups;
};