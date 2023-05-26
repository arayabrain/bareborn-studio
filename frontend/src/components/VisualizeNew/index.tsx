import {styled, Box, Typography, Container} from "@mui/material";
import {useCallback, useState} from "react";
import {loadParams, saveParams} from "../../api/auth";
import Loading from "../common/Loading";

type InputType = {
  text: string
  value?: string
  onChange: (e: any) => void
}

type ParamsType = {
  cut_coords: {
    coronal: string
    sagittal: string
    horizontal: string
  }
  threshold: string
}

const regexInput = /[^0-9,-]/

const WrapperInput = ({text, value, onChange} : InputType) => {
    return (
        <Wrapper>
            <Typography sx={{minWidth: 100}}>{text}</Typography>
            <VisualizeInput
                name={text}
                sx={{width: 250}}
                value={value}
                onChange={(event: any) => onChange(event)}
            />
        </Wrapper>
    )
}

const VisualizeNew = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [dataParams, setDataParams] = useState<ParamsType>({
    cut_coords: {
      coronal: '',
      sagittal: '',
      horizontal: '',
    },
    threshold: ''
  })
  const onLoadParams = async () => {
    setIsLoading(true)
    try {
      const res = await loadParams()
      const { coronal, sagittal, horizontal} = res.cut_coords
      const newCutCoords = {
        coronal: coronal.join(','),
        sagittal: sagittal.join(','),
        horizontal: horizontal.join(',')
      }
      setDataParams({cut_coords: newCutCoords, threshold: res.threshold.join(',')})
    }
    finally {
      setIsLoading(false)
    }
  }

  const checkCharEnd = useCallback((value: string) => {
    return value[value.length - 1] === ',' || value[value.length - 1] === '-' || !value
  },[dataParams])

  const onSaveParams = async () => {
    if(!dataParams) return
    const { coronal, sagittal, horizontal} = dataParams.cut_coords
    if(checkCharEnd(coronal) || checkCharEnd(sagittal) || checkCharEnd(horizontal) || checkCharEnd(dataParams.threshold)) {
      return
    }
    const newParams = {
      threshold: dataParams.threshold.split(',').map((item: string) => Number(item)),
      cut_coords: {
        coronal: coronal.split(',').map((item: string) => Number(item)),
        sagittal: sagittal.split(',').map((item: string) => Number(item)),
        horizontal: horizontal.split(',').map((item: string) => Number(item))
      }
    }
    setIsLoading(true)
    try {
      await saveParams(newParams)
    }
    finally {
      setIsLoading(false)
    }
  }
  const onChangeParams = (event: any) => {
    let { value, name } = event.target
    if(regexInput.test(value)) {
      const checkChar = (checkChar: any, value: any) => {
        const arrValue = value.split('')
        const index = arrValue.findIndex((item: string) => regexInput.test(item))
        if(index !== -1) {
          value = value.replace(value[index], '')
          return checkChar(checkChar, value)
        }
        return value
      }
      value = checkChar(checkChar, value)
    }
    if(name === 'threshold') {
       setDataParams({...dataParams, threshold: value || []})
      return
    }
    const newCutCoords = {...dataParams.cut_coords, [name]: value}
    setDataParams({...dataParams, cut_coords: newCutCoords})
  }

  return (
      <Container>
          <Title>STAT IMAGES</Title>
          <VisualizeInputWrapper>
            <Box>
                <WrapperInput
                    text={'threshold'}
                    value={dataParams?.threshold || ''}
                    onChange={onChangeParams}
                />
            </Box>
            <CutCoords>
                <Typography>cut_coords</Typography>
                <Box>
                    <WrapperInput
                        text={'coronal'}
                        value={dataParams?.cut_coords.coronal || ''}
                        onChange={onChangeParams}
                    />
                    <WrapperInput
                        text={'sagittal'}
                        value={dataParams?.cut_coords.sagittal || ''}
                        onChange={onChangeParams}
                    />
                    <WrapperInput
                        text={'horizontal'}
                        value={dataParams?.cut_coords.horizontal || ''}
                        onChange={onChangeParams}
                    />
                </Box>
            </CutCoords>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <ParamsButton onClick={onSaveParams}>Save Params</ParamsButton>
              <ParamsButton onClick={onLoadParams}>Load Params</ParamsButton>
            </Box>
          </VisualizeInputWrapper>
          <ButtonWrapper>
              <VisualizeButton>GENERATE</VisualizeButton>
              <VisualizeButton>DOWNLOAD</VisualizeButton>
          </ButtonWrapper>
          <ImageWrapper>
              <Image src={'/Images/image-visualize.png'} alt={''} />
          </ImageWrapper>
        {
          isLoading &&
          <Loading />
        }
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
    objectFit: 'contain',
})

export default VisualizeNew