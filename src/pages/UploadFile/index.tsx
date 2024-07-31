import React, { useState, useRef, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Spinner, Table, Modal } from 'react-bootstrap'
import { toast } from 'react-toastify'
import {
	getPresignedUrl,
	postPresignedUrl,
	ingestFile,
	getUploadedDocuments,
	deleteDocument,
	downloadDocument,
	readDocument,
} from '../../api/explorer';
import { downloadFile } from '../../utils/downloadFile';
import { TrackResponse } from '../../api/posthogAPIMonitoring';
import './index.css'

interface Doc {
	file_id: string
	file_name: string
}

const SecondBrainItem: React.FC<{ doc: Doc; refreshFn: any; onEditClick: (doc: Doc) => void }> = ({ doc, refreshFn, onEditClick }) => {
	const [loading, setLoading] = useState<boolean>(false)
	const deleteFile = async () => {
		try {
			setLoading(true)
			const response = await deleteDocument(doc.file_id)
			TrackResponse(response, `delete/explorer/document/${doc.file_id}`,undefined);
			const data = response.data
			console.log('Response from delete Document API:', data)
			toast.success('File deleted successfully')

			refreshFn()
		} catch (error: any) {
			toast.error('Error deleting the selected file')
			console.error('Error fetching uploaded documents:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	const downloadSecondBrain = async () => {
		try {
			setLoading(true)
			const response = await downloadDocument(doc.file_id);
			TrackResponse(response, `delete/explorer/document/${doc.file_id}`,undefined);
			const data = response.data
			console.log('Response from download Document API:', data)
			downloadFile(data.url, doc.file_name)
				.then(() => toast.success('Second Brain downloaded successfully'))
				.catch(() => toast.error('Error downloading the Second Brain'))
		} catch (error: any) {
			toast.error('Error downloading the selected file')
			console.error('Error fetching uploaded documents:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	return (
			<tbody className='text-center' >
				<tr key={doc.file_id}>
				<td style={{ width: '50%' }} >{doc.file_name}</td>
				<td style={{ width: '20%' }}>
					<Button variant='success' onClick={() => downloadSecondBrain()} disabled={loading}>
					Download
					</Button>
				</td>
				<td style={{ width: '10%' }}>
					<Button variant='primary' onClick={() => onEditClick(doc)} disabled={loading}>
					Edit
					</Button>
				</td>
				<td style={{ width: '20%' }}>
					<Button variant='danger' onClick={() => deleteFile()} disabled={loading}>
					Delete
					</Button>
				</td>
				<td style={{ width: '10%' }}>
					{loading && (
					<Spinner animation='border' role='status'>
						<span className='sr-only'>Loading...</span>
					</Spinner>
					)}
				</td>
				</tr>
			</tbody>
	)
}

function UploadFile() {
	const [selectedFile, setSelectedFile] = useState<any | null>(null)
	const [uploadedDocs, setUploadedDocs] = useState<Doc[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [showEditModal, setShowEditModal] = useState<boolean>(false)
	const [editingDoc, setEditingDoc] = useState<Doc | null>(null)
	const [editedContent, setEditedContent] = useState<string>('')
	const [editModalLoading, setEditModalLoading] = useState<boolean>(false)
	const [saveLoading, setSaveLoading] = useState<boolean>(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0]
			const allowedTypes = ['application/json', 'text/plain']
			if (allowedTypes.includes(file.type)) {
				setSelectedFile(file)
			} else {
				toast.error('Only JSON, PDF, and Text files are allowed')
				event.target.value = '' // Clear the file input
			}
		}
	}

	const generatePresignedUrl = async (fileName: string, fileId?: string): Promise<any> => {
		try {
			const response = await getPresignedUrl(fileName, fileId)
			const data = response.data
			// success
			console.log('Response from get presigned API:', data)
			return data.presigned_url
		} catch (error: any) {
			console.error('Error generating pre-signed URL:', error)
			throw error
		}
	}

	const uploadFileToS3 = async (file: File, presignedUrl: string, params: any): Promise<void> => {
		try {
			const formData = new FormData()
			Object.keys(params.fields).forEach((key) => {
				formData.append(key, params.fields[key])
			})
			formData.append('file', file)
			const response = await postPresignedUrl(presignedUrl, formData)

			console.log('File uploaded successfully:', response)
		} catch (error) {
			console.error('Error uploading file to S3:', error)
			throw error
		}
	}

	const uploadTextToS3 = async(text: string, presignedUrl: string, params: any): Promise<void> => {
		try {
			const formData = new FormData()
			Object.keys(params.fields).forEach((key) => {
				formData.append(key, params.fields[key])
			})
			formData.append('file', text)
			const response = await postPresignedUrl(presignedUrl, formData)
			console.log('File uploaded successfully:', response)
		} catch (error) {
			console.error('Error uploading text to S3:', error)
			throw error
		}
	}

	const fetchUploadedFiles = async () => {
		try {
			setLoading(true)
			const response = await getUploadedDocuments()
			const data = response.data

			return data.files
		} catch (error: any) {
			console.error('Error fetching uploaded documents:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}

	const refreshUploadedFiles = async () => {
		let currentDocs = JSON.parse(JSON.stringify(uploadedDocs))
		let newDocs = await fetchUploadedFiles()
		while (currentDocs.length === newDocs.length) {
			await new Promise((resolve) => setTimeout(resolve, 5000))
			currentDocs = JSON.parse(JSON.stringify(uploadedDocs))
			newDocs = await fetchUploadedFiles()
		}
		setUploadedDocs(newDocs)
	}

	const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault()
		if (!selectedFile) {
			toast.error('Please select a file before uploading.')
			return
		}
		setLoading(true)
		try {
			const presignedUrl = await generatePresignedUrl(selectedFile.name)
			const params = presignedUrl
			const url = `${presignedUrl.url}`
			console.log('url :', url)
			console.log("presigned url generated successfully");
			await uploadFileToS3(selectedFile, url, params)

			const fileData = {
				bucket_name: 'youtube-brand-compass-builder-data',
				channel_name: '',
				file_key: presignedUrl.fields.key,
			}

			console.log(fileData)
			console.log("file uploaded successfully");
			
			const response = await ingestFile(fileData)
			console.log(response)
			
			console.log("file ingested successfully");
			setLoading(false)
			toast.success('File added successfully')

			// Clear the file input
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
			setSelectedFile(null)

			// Refresh second brains
			await refreshUploadedFiles()
		} catch (error) {
			toast.success("File uploaded successfully");
			setSelectedFile(null);
			await refreshUploadedFiles();
			setLoading(false);
		} finally{
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleEditClick = (doc: Doc) => {
		setEditingDoc(doc)
		setEditModalLoading(true)
		setShowEditModal(true)
		downloadDocument(doc.file_id).then((response: any) => {
			readDocument(response.data.url).then((content: string) => {
				setEditedContent(content);
				setEditModalLoading(false);
			});
		})
	}

	const handleSaveEdit = async () => {
		if (editingDoc && editedContent) {
			try {
				setSaveLoading(true)
				const presignedUrl = await generatePresignedUrl(editingDoc.file_name, editingDoc.file_id)
				const params = presignedUrl
				const url = `${presignedUrl.url}`
				console.log('url :', url)
				console.log("presigned url generated successfully");
				await uploadTextToS3(editedContent, url, params)
	
				const fileData = {
					bucket_name: 'youtube-brand-compass-builder-data',
					channel_name: '',
					file_key: presignedUrl.fields.key,
				}
	
				console.log(fileData);
				console.log("file uploaded successfully");
				
				const response = await ingestFile(fileData)
				console.log(response)
				
				console.log("file updated successfully");
				toast.success('Document updated successfully')
			} catch (error) {
				toast.error("Failed to update document");
				
			} finally{
				setSaveLoading(false);
				setShowEditModal(false);
			}
		}
	}

	useEffect(() => {
		refreshUploadedFiles()
	}, [])

	return (
		<Container fluid className='d-flex flex-column justify-content-justify align-items-center vh-100'>
			<h1>Upload Second Brains</h1>
			<Col md={6} className='d-flex flex-column'>
				<Form onSubmit={handleFileUpload} className='text-center'>
					<Form.Group className='mb-2'>
						<Form.Label>Upload File</Form.Label>
						<Form.Text className='w-100 text-muted text-center'> (Only JSON and Text files)</Form.Text>
					</Form.Group>
					<Form.Group className='d-flex justify-content-center align-items-center'>
						<Form.Control
							type='file'
							id='custom-file'
							onChange={handleFileChange}
							className=''
							accept='.json, .txt'
							ref={fileInputRef}
						/>
						<Button variant='primary' type='submit' className='m-sm-2'>
							Submit
						</Button>
						{loading && (
							<Spinner animation='border' role='status' className='ml-2'>
								<span className='sr-only'>Loading...</span>
							</Spinner>
						)}
					</Form.Group>
				</Form>
			</Col>

			{/* Uploaded Second Brains */}
			<Container className='mt-5'>
				<h3 className='text-center mb-4'>Uploaded Second Brains</h3>
				
				<Table striped hover> 
					<thead className='text-center'>
						<tr>
							<th style = {{width:'40%'}}>File Name</th>
							<th style = {{width:'20%'}}>Download</th>
							<th style = {{width:'20%'}}>Edit</th>
							<th style = {{width:'20%'}}>Delete</th>
						</tr>
					</thead>
					{uploadedDocs.map((doc, index) => (
						<>
							{index !== 0 }
							<SecondBrainItem key={doc.file_id} doc={doc} refreshFn={refreshUploadedFiles} onEditClick={handleEditClick} />
						</>
					))}
				</Table>	
			</Container>

			{/* Edit Modal */}
			<Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl">
				<Modal.Header closeButton>
					<Modal.Title>Edit Document</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{editModalLoading ? (
						<div className="text-center">
							<Spinner animation="border" role="status">
								<span className="sr-only">Loading...</span>
							</Spinner>
						</div>
					) : (
						<Form.Control
							as="textarea"
							rows={20}
							value={editedContent}
							onChange={(e) => setEditedContent(e.target.value)}
							style={{ minHeight: '400px' }}
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowEditModal(false)}>
						Close
					</Button>
					<Button variant="primary" onClick={handleSaveEdit} disabled={editModalLoading || saveLoading}>
						{saveLoading ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
								/>
								{' '}Save
							</>
						) : (
							'Save Changes'
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	)
}

export default UploadFile