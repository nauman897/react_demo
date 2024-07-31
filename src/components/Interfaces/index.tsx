/*
	Stores all the interfaces used across entire repository
*/

// Channel
export interface ChannelInterface {
	avatarUrl: string
	bannerUrl: string
	country : string
	description : string
	displayName: string
	handle: string
	id: string
	processedAt: string
	subscriberCount: number
	verified: boolean
	videoCount: number
	viewCount: number
}

export interface ChannelCardProps {
	channel : ChannelInterface
	handleChannelCardClick: () => void;
}


// Video
export interface VideoInterface {
	publishedAt: string
	duration: number
	thumbnail?: string;
    thumbnails?: Thumnails;
	viewCount: number
	channelId : string
	id: string
	outlierScore : number
	processedAt: string
	title: string
	likeCount: string 
	description: string
}


export interface VideoCardProps {
	video: VideoInterface;
	isSelected:boolean;
	handleVideoCardClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}



interface Thumnail {
	url: string
	width: number
	height: number
}

export interface Thumnails {
	default: Thumnail
	medium: Thumnail
	high: Thumnail
	standard: Thumnail
	maxres: Thumnail
}
  
export interface VideoStatInterface {
	commentCount: number;
	commentCountDelta: number;
	date: string;
	estimatedHighRevenueUsd: number;
	estimatedLowRevenueUsd: number;
	id: string | null;
	likeCount: number;
	likeCountDelta: number;
	rollingHighRevenue: number;
	rollingLowRevenue: number;
	videoId: string;
	viewCount: number;
	viewCountDelta: number;
}

export interface VideoDropdownProps {
    onVideoSelect: (eventKey: string | null) => void;
    selectedChannel: string;
    reset: boolean;
}

// Analysis Execution
export interface ExecutionObject{
	id: string
	startDate: string
	status: string
	stopDate: string | null
	input : ExecutionObjectInput
	executionArn: string
	error?: string
	// cause: string
}

interface ExecutionObjectInput{
	selected_prompts : string[]
	video_ids : string[]
	channel_id : string
	channel_handle : string
}

export interface ExecutionDetails {
	status : string
	channel_handle: string
	videos: ExecutionDetailsElements[]
}

export interface ExecutionDetailsElements {
	video_id : string
	"error-info" ?: {Error : string, Cause:string} | null
	details: ExecutionVideoDetails
	analysis: ExecutionAnalysisDetails[]
}

export interface ExecutionVideoDetails{
	processedAt: string
	id: string
	title: string
	description: string
	duration: string
	thumbnails: Thumnails
	viewCount: string
	likeCount: string
	publishedAt: string
	outlier_score : number
	gcs_url?: string
	channel_id : string
}

export interface ExecutionAnalysisDetails{
	videoId : string
	promptId : string
	title : string
	body : string
	type : string
	prompt : string
}

// Template
export interface Template {
	title: string;
	testResultsPdfUrl : string;
	updatedAt : string;
	releasedAt : string | null;
	id: string;
	testStatus: string;
	releaseStatus: string;
	testedAt : string;
	createAt : string;
}

export interface DuplicateTemplateProps {
	template: Template;
}

export interface UpdateTemplateProps {
	template: Template;
}

// Prompt
export interface Prompt {
	key: string;
	value: string;
	type: string;
}

  // on analyze channel page since its of the form of dictionary
export interface PromptDict {
	id : string,
	type : string,
	title: string,
	prompt: string
}

export interface PromptCheckboxProps {
	prompt: string;
	prompt_id : string
	checked: boolean;
	onSelectDeselectPrompt: (prompt: string) => void;
  }
  
// Reports
export interface MarkdownDropdownProps {
	onSelect: (template: Template | null) => void;
	selectedTemplate: string | undefined;
	templates: Template[];
	fetchTemplates: () => void;
}

export interface ReportInterface{
	status: string;
	title: string;
	templateId: string;
	requestedAt: string;
}

// API
export interface ChannelAnalysisRequestData {
	channelId: string
	selectedPrompts: string[]
	videoIds: string[]
}

// Graph
export interface GraphProps {
	video_id: string | undefined;
	channel_id: string | undefined;
}

// Modals
export interface CurrentAnalysisModalProps {
    showAnalysisModal: boolean;
    handleAnalysisModalClose: () => void;
    video_title: string | undefined;
    currentAnalysis : object | undefined;
}

export interface DeleteModalProps {
	showDeleteModal: boolean;
	handleCloseDeleteModal: () => void;
	handleDelete: (deleteFromChannels: boolean) => void;
	template_title: string | undefined;
}

export interface ReportModalProps {
	showReport: boolean;
	handleClose: () => void;
	brandCompassDocument: string | undefined;
	channelId: string | undefined;
	channelName: string | undefined;
	template: ReportInterface | null;
	pdfUrl: string | null;
	downloadFile: (url: string, filename: string) => void;
	fetchAvailableReports : () => void;
}

export interface ReportVersionProps {
	showReportVersion: boolean;
	handleCloseReportVersion: () => void;
	channelId: string | undefined;
	template_id: string;
	versions: ReportInterface[];
	refreshVersions: () => void; 
}