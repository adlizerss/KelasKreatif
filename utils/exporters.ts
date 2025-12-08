import { GroupResult } from '../types';
import FileSaver from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

// Handle potential ESM default export differences for file-saver
// Some builds export the function as default, others as a property.
const saveAs = (FileSaver as any).saveAs || FileSaver;

export const exportToTxt = (groups: GroupResult[]) => {
  let content = '';
  groups.forEach((group) => {
    content += `=== ${group.name} ===\n`;
    group.members.forEach((member, index) => {
      content += `${index + 1}. ${member.name}\n`;
    });
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'pembagian-kelompok.txt');
};

export const exportToDocx = async (groups: GroupResult[]) => {
  const children = [];

  // Title
  children.push(
    new Paragraph({
      text: "Hasil Pembagian Kelompok",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  groups.forEach((group) => {
    // Group Header
    children.push(
      new Paragraph({
        text: group.name,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    // Members
    group.members.forEach((member) => {
      children.push(
        new Paragraph({
          text: member.name,
          bullet: {
            level: 0,
          },
        })
      );
    });
    
    // Add empty line
    children.push(new Paragraph({}));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'pembagian-kelompok.docx');
};