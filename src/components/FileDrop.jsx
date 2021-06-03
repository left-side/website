import { useState } from "react"
import { useDropzone } from "react-dropzone"
import styled, { css } from "styled-components"
import { useSnapshot } from "valtio"
import { state } from "@/store"

const maxUploadSize = 25000000

const FileDrop = () => {
  const { files } = useSnapshot(state)
  const [error, setError] = useState("")
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // accept: `image/*,video/*,text/*,.pdf,.doc,.docx,xls,.xlsx,.ppt,.pptx,.csv,.json,.pages,.numbers,.keynote,.psd,.ai,.zip`,
    multiple: true,
    onDrop: files => {
      const merge = (a, b, p) => a.filter(aa => !b.find(bb => aa[p] === bb[p])).concat(b)
      const update = merge(
        state.files,
        files.map(file => ({
          path: file.path,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
        })),
        "path"
      )
      const size = update.reduce((acc, { size }) => acc + size, 0)
      if (size > maxUploadSize) return setError("Maximum upload size of 25MB.")
      state.files = update
      setError("")
    },
  })
  return (
    <Container>
      <Droppy {...getRootProps({ isDragActive })}>
        <input {...getInputProps()} />
        <Text>Click or drag files to upload</Text>
      </Droppy>
      {!!files.length && (
        <FileZone>
          {files.map(file => (
            <File
              key={file.path}
              {...file}
              onClick={e => {
                e.stopPropagation()
                state.files = files.filter(({ name }) => name !== file.name)
              }}
            />
          ))}
        </FileZone>
      )}
      {error && <Err>{error}</Err>}
    </Container>
  )
}

export default FileDrop

const File = ({ name, onClick }) => {
  return <FileWrap onClick={onClick}>{`${name.length > 22 ? "..." : ""}${name.slice(-22)}`}</FileWrap>
}

const getColor = props => {
  if (props.isDragActive) {
    return "#2196f3"
  }
  return "#eeeeee"
}

const Container = styled.div`
  display: grid;
  grid-template-rows: min-content;
  grid-row-gap: 2rem;
`
const Droppy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  background-color: #fafafa;
  outline: none;
  transition: border 0.24s ease-in-out;
  width: 45rem;
  height: 10rem;
  filter: drop-shadow(1rem 1rem 0 #2d2a32) drop-shadow(-1rem -1rem 0 #2d2a32);
  ${({ isDragActive }) =>
    isDragActive &&
    css`
      filter: drop-shadow(1rem 1rem 0 #ff66b3) drop-shadow(-1rem -1rem 0 #ff66b3);
    `}
`

const Text = styled.h6`
  font-size: 2.6rem;
  color: #2d2a32;
  filter: drop-shadow(6px 6px 0 rgba(235, 235, 235, 1)) drop-shadow(-6px -6px 0 rgba(235, 235, 235, 0.5));
`
const FileZone = styled.div`
  padding: 1rem;
  border: 2px dashed #eee;
  height: 6rem;
  width: 45rem;
  overflow-x: scroll;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`
const FileWrap = styled.p`
  white-space: nowrap;
  margin: 0 1rem;
  padding: 5px;
  font-size: 1.6rem;
  background: white;
  filter: drop-shadow(4px 4px 0 #2d2a32) drop-shadow(-4px -4px 0 #2d2a32);
  position: relative;
  transition: all 0.2s;
  &:hover {
    cursor: pointer;
    filter: drop-shadow(4px 4px 0 #b80c09) drop-shadow(-4px -4px 0 #b80c09);
    &:after {
      opacity: 1;
      visibility: visible;
    }
  }
  &:after {
    content: "DELETE";
    background: white;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    font-family: Orbitron;
    font-weight: 500;
  }
`
const Err = styled.aside`
  color: #b80c09;
  justify-self: center;
  font-family: Orbitron;
  font-weight: 500;
  font-size: 2rem;
`