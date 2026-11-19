import type { QaRecord } from "../qa/types.ts";

const record: QaRecord = {
  id: "lose-cry", name: "输了就哭", icon: "🏁", category: "feel",
  age: { from: 36 },
  title: "为什么输了我会哭，一定要赢？",
  trigger: "和爸爸比赛搭积木塔，爸爸先搭好了，小念把积木一推，哭着说「不算不算」",
  dialogue: [
    {
      nian: "爸爸，比赛输了我就想哭，还把积木推倒了。我是不是输不起？",
      dad: "输了难过一点也不奇怪，大人输了也会不痛快。你哭，是因为你真的很想赢、很在乎。推积木不对，可那份难过是真的，爸爸懂。很多小朋友三岁多以后开始懂输赢，也就开始会为输赢难过。",
    },
    {
      nian: "开始懂输赢？难道更小的时候不懂吗？",
      dad: "真的不懂！科学家让小朋友和大人比赛，看谁先完成一个小任务。差不多三岁以前的孩子，先做完、后做完都一样开心，好像不知道有「赢」这回事；大一点的孩子，赢了就特别高兴。懂得自己比别人快还是慢，是长大的一个信号。",
      show: { kind: "steps", frames: [{ icon: "🧒", label: "不到三岁" }, { icon: "😊", label: "输赢都开心" }, { icon: "🧑", label: "三岁多以后" }, { icon: "🏆", label: "赢了更开心" }] },
    },
    {
      nian: "长大的信号？那为什么有的游戏输了我不太难过，有的特别难过？",
      dad: "因为游戏不一样。飞行棋靠扔骰子，输了只是运气不好；搭积木比快靠本事，输了就像在说「你不够厉害」，心里更疼。科学家还发现，三岁的孩子简单的事没做好，会更难为情；难的事做成了，会更骄傲。",
    },
    {
      nian: "输了心里更疼，那爸爸每次都让我赢，好不好？",
      dad: "不太好。有个实验，让三岁和五岁的孩子跟一个手偶比赛，赢了有贴纸。手偶故意帮孩子赢，两个年纪都有孩子抗议，要它认真比，虽然这样自己可能拿不到贴纸。原来你们心里也明白，真比赛要两边都认真。总让你赢，真赢了反而没那么开心。",
    },
    {
      nian: "两边都认真，那输了以后，我的难过怎么办？",
      dad: "先让难过待一会儿，哭一哭也行，但不推东西、不打人。等平静了，想想刚才哪里做得好：你搭得比上次高，你一直守规矩。再说一句「再来一局」。爸爸输了也会说：「好可惜，不过真好玩！」做给你看。",
      show: { kind: "steps", frames: [{ icon: "😢", label: "先难过一会儿" }, { icon: "🍃", label: "慢慢平静" }, { icon: "👍", label: "想想哪里好" }, { icon: "🔁", label: "再来一局" }] },
    },
    {
      nian: "再来一局要是又输了，我会不会一直这么难过？",
      dad: "大多数孩子越长大，越能应付比赛和输赢，每个孩子早晚不一样。你可以先多玩靠运气的游戏练练手，再慢慢玩靠本事的。每次输了又愿意再来，你面对输的本领就长了一点。",
    },
    {
      nian: "我懂了！我输了会哭，是因为我懂输赢了，又特别在乎。难过可以，推东西不行，平静了再来一局！",
      dad: "说好了！下一局不管谁赢，咱俩都要说一句「真好玩」。",
    },
  ],
  parentTip: "约 3 岁前后孩子开始理解输赢，赢了会更高兴；3 岁孩子做砸简单任务时更难为情，做成难的更骄傲。输了哭往往说明孩子在乎、开始评价自己。可先玩运气类游戏，再过渡到技巧类；接纳情绪但不接受推打；夸努力和守规则，大人示范怎么输；偶尔让孩子赢可以，总让赢会让真赢没意思。如果每次输都长时间崩溃、因此回避所有游戏，或和同伴冲突不断，可以找儿科医生或专业人员聊聊。",
  sources: [
    {
      who: "Stipek、Recchia & McClintic（1992）",
      title: "Self-Evaluation in Young Children",
      url: "https://pubmed.ncbi.nlm.nih.gov/1560797/",
      says: "比赛任务里，不到 33 个月的孩子不懂输赢，输赢不影响心情；大一点的孩子赢了会更开心。",
      limit: "是实验室里的小任务，不说明在家下棋输了会怎样。",
    },
    {
      who: "Lewis、Alessandri & Sullivan（1992）",
      title: "Differences in Shame and Pride as a Function of Children's Gender and Task Difficulty",
      url: "https://pubmed.ncbi.nlm.nih.gov/1600827/",
      says: "3 岁孩子简单任务失败时更难为情，难任务成功时更骄傲。",
      limit: "只观察了 30 个孩子，看的是表情和动作。",
    },
    {
      who: "Schmidt、Hardecker & Tomasello（2016）",
      title: "Preschoolers understand the normativity of cooperatively structured competition",
      url: "https://sites.duke.edu/tomasellolabduke/files/2016/09/Schmidt.Hardecker.Tomasello_Preschoolers_JExpChildPsych_2016.pdf",
      says: "48 个 3、5 岁孩子为贴纸和手偶比赛；手偶故意帮孩子赢时，两组都有孩子抗议，不过不少 3 岁孩子没出声。",
      limit: "是玩偶游戏实验，不说明孩子输了会不会难过。",
    },
    {
      who: "澳大利亚 Raising Children Network",
      title: "Playing fair: tips for kids & parents",
      url: "https://raisingchildren.net.au/school-age/play-media-technology/playing-with-others/fair-play",
      says: "输掉运气游戏比输掉技巧游戏好接受；夸努力和守规则；偶尔让孩子赢可以，总让赢会让真赢没意思。",
      limit: "是育儿建议，不是实验结果。",
    },
  ],
};

export default record;
