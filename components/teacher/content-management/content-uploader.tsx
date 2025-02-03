import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "./file-upload"
import { TextEditor } from "./text-editor"

export function ContentUploader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Course Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">Files (PPT/PDF)</TabsTrigger>
            <TabsTrigger value="text">Text Content</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <FileUpload />
          </TabsContent>

          <TabsContent value="text">
            <TextEditor />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}