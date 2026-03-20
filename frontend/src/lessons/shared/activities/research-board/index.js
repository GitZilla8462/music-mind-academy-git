// File: research-board/index.js
// Public exports for the Research Board module

export { default as ResearchBoard } from './ResearchBoard';
export {
  getResearchBoard,
  saveResearchBoard,
  addHighlight,
  removeHighlight,
  updateHighlightSlideTag,
  addImage,
  removeImage,
  updateImageSlideTag,
  setTopic,
  getHighlightsForSlide,
  getImagesForSlide,
  isResearchReady,
  getResearchSummary,
} from './researchBoardStorage';
