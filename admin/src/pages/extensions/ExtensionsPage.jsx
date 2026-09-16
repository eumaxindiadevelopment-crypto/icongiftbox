import { Puzzle } from 'lucide-react'
import { Card, CardBody } from '../../components/ui/Card'

export function ExtensionsPage() {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Puzzle size={24} className="text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">No extensions installed</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            The extensions marketplace is coming soon. Check back here to browse and install add-ons for your store.
          </p>
        </div>
      </CardBody>
    </Card>
  )
}
