import {styled, Box, Typography, Container} from "@mui/material";

const WrapperInput = ({text} : {text: string}) => {
    return (
        <Wrapper>
            <Typography sx={{minWidth: 100}}>{text}</Typography>
            <VisualizeInput sx={{width: 250}}/>
        </Wrapper>
    )
}

const VisualizeNew = () => {
  return (
      <Container>
          <Title>
              STAT IMAGES
          </Title>
          <VisualizeInputWrapper>
            <Box>
                <WrapperInput text={'threshold'}/>
            </Box>
            <CutCoords>
                <Typography>cut_coords</Typography>
                <Box>
                    <WrapperInput text={'coronal'}/>
                    <WrapperInput text={'sagittal'}/>
                    <WrapperInput text={'horizontal'}/>
                </Box>
            </CutCoords>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <ParamsButton>Save Params</ParamsButton>
              <ParamsButton>Load Params</ParamsButton>
            </Box>
          </VisualizeInputWrapper>
          <ButtonWrapper>
              <VisualizeButton>GENERATE</VisualizeButton>
              <VisualizeButton>DOWNLOAD</VisualizeButton>
          </ButtonWrapper>
          <ImageWrapper>
              <Image src={'/Images/image-visualize.png'} alt={''} />
          </ImageWrapper>
      </Container>
  )
}

const Wrapper = styled(Box)({
    display: 'flex'
})

const Title = styled(Typography)({
    fontSize: 25,
    fontWeight: 700,
    margin: '50px 0',
})

const CutCoords = styled(Box)({
    display: 'flex',
    gap: 10,
    marginBottom: 50
})

const VisualizeInputWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between'
})

const ParamsButton = styled('button')({
  height: 'fit-content',
  padding: 5,
  '&:hover': {
    cursor: 'pointer',
    background: '#d1d7e0',
    boxShadow: '0 0 0 4px #fff, 0 0 0 8px #4070f4'
  }
})

const ButtonWrapper = styled(Box)({
    display: 'flex',
    gap: 10,
    marginBottom: 50
})

const VisualizeButton = styled('button')({
    border: '1px solid #006fff',
    color: '#006fff',
    padding: 10,
    '&:hover': {
        cursor: 'pointer',
        background: '#d1d7e0'
    }
})

const VisualizeInput = styled('input')({
    height: 'fit-content'
})

const ImageWrapper = styled(Box)({
    width: '80%',
    margin: 'auto'
})

const Image = styled('img')({
    width: '100%',
    objectFit: 'contain'
})

export default VisualizeNew