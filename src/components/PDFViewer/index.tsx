import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
pdfjs.GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs'

const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
	const [numOfPages, setNumOfPages] = useState<number>(1)
	const [pageNumber, setPageNumber] = useState<number>(1)

	function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
		setNumOfPages(numPages)
	}

	useEffect(() => {
		setPageNumber(1);
	}, [pdfUrl]);
	
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
				<Page pageNumber={pageNumber} />
			</Document>
			<ButtonGroup size='sm'>
				<Button onClick={() => setPageNumber((currentPage) => currentPage - 1)} disabled={pageNumber <= 1}>
					{'<'}
				</Button>
				<Button disabled={true} variant='secondary'>
					Page {pageNumber || (numOfPages ? 1 : '--')} of {numOfPages || '--'}
				</Button>
				<Button
					onClick={() => setPageNumber((currentPage) => currentPage + 1)}
					disabled={pageNumber >= numOfPages}>
					{'>'}
				</Button>
			</ButtonGroup>
		</div>
	)
}

export default PDFViewer
