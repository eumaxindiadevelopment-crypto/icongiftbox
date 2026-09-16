import { Modal } from './Modal'
import { MediaPage } from '../../pages/media/MediaPage'

export function MediaPicker({ open, onClose, onSelect }) {
  const handleSelect = (file) => {
    onSelect(file)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Select from Media Library" size="xl">
      <MediaPage selectionMode onSelect={handleSelect} />
    </Modal>
  )
}
