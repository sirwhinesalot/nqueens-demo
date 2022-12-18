import { invoke } from '@tauri-apps/api/tauri';
import { useCallback, useState } from 'react';
import {
  useMantineTheme,
  useMantineColorScheme,
  Button, Header, Group, Flex, Text, Navbar, Stack, List, NumberInput, Select, Checkbox, Divider, Progress,
} from '@mantine/core';
import { FaChessQueen, FaChessBoard } from 'react-icons/fa'
import { AiOutlineStop, AiFillRobot } from 'react-icons/ai';
import { TbSun, TbMoon, TbBulb } from 'react-icons/tb';

const red_gradient = {from: 'red', to: 'orange', deg: 45};
const expectedSolutions = [
  {fundamental: 0, all: 0}, // 0
  {fundamental: 1, all: 1}, // 1
  {fundamental: 0, all: 0}, // 2
  {fundamental: 0, all: 0}, // 3
  {fundamental: 1, all: 2}, // 4
  {fundamental: 2, all: 10}, // 5
  {fundamental: 1, all: 4}, // 6
  {fundamental: 6, all: 40}, // 7
  {fundamental: 12, all: 92}, // 8
  {fundamental: 46,	all: 352}, // 9
  {fundamental: 92, all: 724}, // 10
  {fundamental: 341, all:	2680}, // 11
  {fundamental: 1787, all: 14200}, // 12
  {fundamental: 9233, all: 73712}, // 13
  {fundamental: 45752, all:	365596}, // 14
  {fundamental: 285053, all: 2279184}, // 15
  {fundamental: 1846955, all:	14772512}, // 16
  {fundamental: 11977939,	all: 95815104}, // 17
  {fundamental: 83263591, all: 666090624}, // 18
  {fundamental: 621012754, all:	4968057848}, // 19
  {fundamental: 4878666808, all: 39029188884}, // 20
]

function ChessBoard(props: {board: number[], queens: number}) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  
  const lightGradient = theme.fn.gradient({ from: theme.colors.gray[1], to: theme.colors.gray[2], deg: 45 })
  const darkGradient = theme.fn.gradient({ from: theme.colors.gray[8], to: theme.colors.gray[7], deg: 45 })
  
  return (
    <table style={{gridArea: "main", backgroundImage: colorScheme == "dark" ? darkGradient : lightGradient}}>
      <tbody>
        {[...Array(props.queens).keys()].map((_, row) => (
          <tr>
            {props.board.length === 0 
              ? [...Array(props.queens).keys()].map(() => <td></td>)
              : props.board.map(q => (q == row) ? <td className="queen"></td> : <td></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function NumQueensInput(props: {queens: number, resetBoard: (q: number) => void, solving: boolean}) {
  const [count, setCount] = useState<number | undefined>(props.queens);
  return (
    <NumberInput
      label="Number of queens:"
      styles={{ error: {display: "none"}, wrapper: {marginBottom: 0} }}
      size="xs"
      error={(count === undefined || count < 3 || count > 20) ? "ERROR" : undefined}
      min={3} max={20}
      icon={<FaChessQueen/>}
      value={count} 
      onChange={(c) => {
        setCount(c);
        if (c && c >= 3 && c <= 20) {
          props.resetBoard(c);
        }
      }}
      disabled={props.solving}
      variant="filled"
      stepHoldDelay={500}
      stepHoldInterval={100}
      noClampOnBlur
    />
  );
}

function SolverSelect(props: {solver: string, setSolver: (s: string) => void}) {
  // TODO: this does nothing for now...
  return (
    <Select size="xs" label="Solver:" variant="filled" icon={<AiFillRobot/>} value={props.solver} onChange={props.setSolver} data={["Gecode"]}/>
  );
}

function BreakSymmetriesCheckbox(props: {solving: boolean, breakSymmetries: boolean, setBreakSymmetries: (b: boolean) => void}) {
  // TODO: this does nothing for now...
  return (
    <Checkbox
      label="Break symmetries"
      checked={props.breakSymmetries}
      disabled={true || props.solving}
      onChange={(event) => props.setBreakSymmetries(event.currentTarget.checked)}
      size="xs"
    />
  );
}

function ShowSolvingState(props: {progress: number | undefined}) {
  return (
    <>
      <Text fz="xs" fw={700}>Solving...</Text>
      <Progress
        value={props.progress === undefined ? 0 : Math.min(props.progress, 100)}
        label={props.progress && props.progress >= 15 && props.progress <= 100 ? Math.trunc(props.progress) + "%" : undefined}
        size="xl" radius="xl" striped animate={props.progress !== undefined && props.progress > 100}
      />
    </>
  )
}

function PickSolution(props: {
  solutions: number | undefined,
  solutionIndex: number | undefined, 
  setSolutionIndex: (s: number) => void,
  setBoard: (b: number[]) => void,
}) {
  const switchSolution = useCallback((i: number | undefined) => {
    if (i && props.solutions && i <= props.solutions && i >= 1) {
      invoke("get_solution", {index: i}).then((v: any) => {
        console.log(v);
        props.setBoard(v);
        props.setSolutionIndex(i);
      });
    }
  }, [props.solutions]);

  return (
    <NumberInput
      label="View Solution:"
      icon={<FaChessBoard/>}
      size="xs"
      variant="filled"
      min={1}
      max={props.solutions}
      disabled={!props.solutions}
      value={props.solutionIndex}
      onChange={switchSolution}
    />
  );
}

let interval: NodeJS.Timer | null = null;

export default function App() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [board, setBoard] = useState<number[]>([]);
  const [queens, setQueens] = useState(8);
  const [solutions, setSolutions] = useState<number | undefined>(undefined);
  const [solutionIndex, setSolutionIndex] = useState<number | undefined>(undefined);
  const [solving, setSolving] = useState(false);
  const [breakSymmetries, setBreakSymmetries] = useState(false);
  const [solver, setSolver] = useState<string>("Gecode");
  const [elapsedTime, setElapsedTime] = useState(0);

  const resetBoard = useCallback((q: number) => {
    setBoard([]);
    setSolutions(undefined);
    setSolutionIndex(undefined);
    setQueens(q);
    setElapsedTime(0);
  }, [board, solutions, solutionIndex, queens]);

  let startTime: number = 0;

  const triggerSolve = useCallback(() => {
    setSolving(true);
    resetBoard(queens);
    // Note: could not use the state hook here because the batching adds a delay!
    startTime = performance.now();
    invoke('solve', {queens: queens}).then((value: any) => {
      interval && clearInterval(interval);
      setSolving(false);
      setSolutions(value);
      setElapsedTime(performance.now() - startTime);
    });
    interval = setInterval(() => {
      invoke('get_num_solutions', {}).then((value: any) => {setSolutions(value);});
      setElapsedTime(performance.now() - startTime)
    }, 100);
  }, [solving, queens]);

  const cancelSolve = useCallback(() => {
    setSolving(false);
    setElapsedTime(performance.now() - startTime)
    interval && clearInterval(interval);
    invoke('cancel', {});
  }, [solving]);

  const progress = solutions === undefined
    ? undefined
    : solutions * 100 / (breakSymmetries ? expectedSolutions[queens].fundamental : expectedSolutions[queens].all);

  const expected = breakSymmetries 
    ? expectedSolutions[queens].fundamental
    : expectedSolutions[queens].all

  return (
    <div className="app">
      <Header p="xs" sx={{gridArea: "header", zIndex: 0}} height="auto">
        <Flex justify="space-between">
          <Group><Text variant="gradient" fz="xl" fw={700}>N-Queens Demo</Text></Group>
          <Group>
            <Button size="xs" variant="default" onClick={() => toggleColorScheme()} title="Toggle color scheme">
              {colorScheme === "dark" ? <TbSun /> : <TbMoon />}
            </Button>
            {!solving 
              ? <Button variant="gradient" p="xs" size="xs" leftIcon={<TbBulb/>} onClick={triggerSolve}>Solve!</Button>
              : <Button variant="gradient" gradient={red_gradient} p="xs" size="xs" leftIcon={<AiOutlineStop/>} onClick={cancelSolve}>Cancel</Button>}
          </Group>
        </Flex>
      </Header>
      <Navbar sx={{zIndex: 0}} width={{ base: 200 }} p={0}>
        <Navbar.Section p="xs" grow>
          <Stack spacing="xs">
            <NumQueensInput queens={queens} resetBoard={resetBoard} solving={solving}/>
            <SolverSelect solver={solver} setSolver={setSolver}/>
            <BreakSymmetriesCheckbox 
              solving={solving} 
              breakSymmetries={breakSymmetries} 
              setBreakSymmetries={setBreakSymmetries}
            />
            <Divider orientation="horizontal"/>
            {solving && <ShowSolvingState progress={progress}/>}
            <List size="xs" listStyleType="circle" >
              <List.Item><Text fz="xs"> Expected: {expected.toLocaleString()}</Text></List.Item>
              <List.Item>Found: {solutions === undefined ? '?' : solutions.toLocaleString()}</List.Item>
              {elapsedTime ? <List.Item>Time: {(elapsedTime / 1000).toLocaleString()}s</List.Item> : <></>}
            </List>
            <PickSolution solutions={solutions} solutionIndex={solutionIndex} setSolutionIndex={setSolutionIndex} setBoard={setBoard}/>
          </Stack>
        </Navbar.Section>
      </Navbar>
      <ChessBoard board={board} queens={queens}/>
    </div>
  )
}