from html import escape
p='diagrams/2026-11-04T161500/diagram.svg'
s=['<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1900" viewBox="0 0 2400 1900">']
def rect(x,y,w,h,fill,stroke='none',rx=14,sw=2): s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def text(x,y,t,size=24,color='#20333b',weight=400,anchor='start'): s.append(f'<text x="{x}" y="{y}" font-size="{size}" font-family="Arial, Noto Sans SC, sans-serif" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(t)}</text>')
def circ(x,y,r,t,fill='#32a878',size=25):
 s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>');text(x,y+size*.33,t,size,'#fff',700,'middle')
def path(points,color='#738892',w=4,arrow=True,dash=False):
 coords=' '.join(f'{x},{y}' for x,y in points);s.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'+(' stroke-dasharray="9 8"' if dash else '')+'/>')
 if arrow:
  (x0,y0),(x,y)=points[-2:];
  if x>x0: q=[(x,y),(x-14,y-8),(x-14,y+8)]
  elif x<x0:q=[(x,y),(x+14,y-8),(x+14,y+8)]
  elif y>y0:q=[(x,y),(x-8,y-14),(x+8,y-14)]
  else:q=[(x,y),(x-8,y+14),(x+8,y+14)]
  s.append('<polygon points="'+' '.join(f'{a},{b}' for a,b in q)+f'" fill="{color}"/>')
rect(0,0,2400,1900,'#f6f8f6')
text(82,85,'GO RUNTIME  /  GMP SCHEDULER',24,'#14816e',700)
text(82,150,'Go 调度全景：从 goroutine 到 CPU',56,'#102b36',700)
text(82,195,'结构图展示常见路径；调度取任务的细节与顺序随 Go 版本和运行状态变化。',24,'#627a80')
# boundaries
rect(64,235,1530,1290,'#ffffff','#d9e5e1',24)
rect(1642,235,690,1290,'#ffffff','#d9e5e1',24)
text(97,285,'调度主干',34,'#163c3b',700)
text(1180,285,'GOMAXPROCS = 3 → 3 个 P',23,'#7d6026',700)
text(1678,285,'任务什么时候离开 / 回来？',32,'#163c3b',700)
# connectors behind shapes
path([(1474,1038),(1609,1038),(1609,400),(1675,400)],'#5d91bd',3,True,True)
path([(1675,535),(1630,535),(1630,302),(1260,302),(1260,310)],'#5d91bd',3,True,True)
path([(1675,1100),(1622,1100),(1622,1080),(1474,1080)],'#aa62b5',3,True,True)
path([(828,360),(828,450)],'#90a3a4',3,False)
for x in [336,835,1334]: path([(828,450),(x,450),(x,492)],'#85999a',3)
# queue full to global represented separate label and arrow
path([(208,492),(208,410),(500,410),(500,397)],'#ca9362',3)
# work steal
path([(505,686),(665,686)],'#aa62b5',4)
path([(1004,686),(1164,686)],'#aa62b5',4)
# lane downward
for x in [336,835,1334]:
 path([(x,805),(x,850)],'#ae8742',4)
 path([(x,950),(x,990)],'#5c86b2',4)
 path([(x,1085),(x,1150)],'#5c86b2',4)
 path([(x,1220),(x,1288)],'#7778b8',4)
# global queue
rect(388,310,884,90,'#e8f5ef','#addbc6',16)
text(415,347,'全局可运行队列',25,'#216650',700)
text(415,378,'全局共享',18,'#6f8d80')
for i,x in enumerate([780,850,920,990,1060,1130]):circ(x,355,23,'G')
text(536,433,'本地满时可转移一批到全局',19,'#a46540')
text(880,433,'P 可从全局获取任务',19,'#607a79')
# local queues
for col,x in enumerate([166,665,1164]):
 rect(x,495,340,315,'#eef8f4','#a8d9c4',18)
 text(x+24,535,f'P{col+1} 的本地可运行队列',23,'#216650',700)
 for j in range(3 if col==0 else (2 if col==1 else 1)):
  y=582+j*65;circ(x+55,y,21,'G');text(x+92,y+8,'可运行 / 等待调度',20,'#477365')
 text(x+24,780,'本地队列保存的是 runnable G',18,'#698c80')
text(545,666,'偷取',20,'#9851a3');text(1044,666,'偷取',20,'#9851a3')
text(540,714,'work stealing',15,'#9851a3');text(1038,714,'work stealing',15,'#9851a3')
# P/M
for col,x in enumerate([166,665,1164]):
 rect(x+50,850,240,100,'#fff3d7','#edcc82',16)
 text(x+74,891,f'P{col+1}',29,'#a16b10',700);text(x+142,890,'调度资源',22,'#7c663d');text(x+74,925,'本地队列 + 缓存等',18,'#967744')
 rect(x+30,990,280,98,'#eaf2fb','#a2c7e7',16)
 text(x+55,1032,f'M{col+1}',29,'#346aa2',700);text(x+129,1030,'操作系统线程',21,'#365e80')
 circ(x+65,1064,16,'G',size=16);text(x+92,1071,'正在运行的 G',19,'#496e8c')
rect(985,998,190,80,'#f1f4f6','#c9d5dc',13)
text(1002,1034,'M4 空闲',23,'#718692',700)
text(1002,1063,'休眠 / 待分配',17,'#8297a0')
rect(275,1150,1120,70,'#eeeafa','#b8b3df',15)
text(835,1195,'操作系统调度器：决定哪个线程获得 CPU',27,'#665ca1',700,'middle')
for i,x in enumerate([336,835,1334]):
 rect(x-95,1290,190,85,'#f9e4e2','#e4aaa1',15);text(x,1345,f'CPU 核 {i+1}',24,'#a84d48',700,'middle')
text(103,1450,'M 与 P 的绑定可变化；CPU 数量与 P 数量不是同一概念。',21,'#60787a')
text(103,1487,'空闲 M 可休眠；执行系统调用的 M 可能阻塞。',21,'#60787a')
# right hand event panels
rect(1675,320,620,260,'#f0f6fd','#b9d2eb',18)
text(1705,365,'网络 I/O：等待与唤醒',27,'#315d88',700)
text(1705,405,'运行中的 G 发起网络请求',22,'#385568')
path([(1720,425),(1720,461)],'#5d91bd',3)
rect(1750,438,220,46,'#dceafa','none',9);text(1770,469,'G 进入 waiting',19,'#315d88',700)
path([(1973,461),(2012,461)],'#5d91bd',3)
rect(2017,438,245,46,'#dceafa','none',9);text(2037,469,'netpoll 等待就绪',19,'#315d88',700)
text(1705,527,'就绪 → runnable → 可入全局 / 本地队列',21,'#385568')
text(1705,559,'等待中的 G 不在可运行队列。',20,'#647f91')
rect(1675,610,620,254,'#fff5e6','#eed1a2',18)
text(1705,657,'阻塞系统调用：P 可以转交',27,'#8c641d',700)
text(1705,700,'M1 进入阻塞 syscall，M1 可能停住',21,'#715d3f')
text(1705,744,'M1 + P1 → M1 阻塞 / P1 → M4',21,'#715d3f')
text(1705,788,'M4 + P1 可继续执行其他 G',21,'#715d3f')
text(1705,830,'P 和 M 不是永久绑定。',20,'#997e55')
rect(1675,894,620,240,'#f7effa','#dec1e9',18)
text(1705,940,'抢占与任务窃取',27,'#7a4384',700)
text(1705,984,'运行较久的 G 可被抢占，重新可运行',20,'#654e6a')
text(1705,1026,'P 缺少任务时，可从其他 P 偷取任务',20,'#654e6a')
text(1705,1068,'也会检查全局队列和网络就绪等来源',20,'#654e6a')
text(1705,1102,'sysmon：请求抢占 / 检查长时间 syscall',19,'#8c7490')
rect(1675,1164,620,264,'#f4f6f6','#d6e0df',18)
text(1705,1210,'状态：区分可运行与等待',27,'#355a56',700)
text(1705,1253,'go 创建 G',21,'#425e5c')
text(1705,1295,'runnable → running → done',22,'#287365',700)
text(1705,1338,'running → waiting → runnable',22,'#287365',700)
text(1705,1382,'网络就绪后还要等调度，未必用原 M。',20,'#647e7a')
# bottom legend
rect(64,1560,2268,265,'#173b43','none',24)
text(100,1622,'读图顺序',31,'#ffffff',700)
text(100,1672,'① 创建 G：可运行任务进入调度体系   ② P 关联 M 执行 G   ③ OS 把 M 调度到 CPU',25,'#e6f1ec')
text(100,1718,'④ 遇到网络等待，G 暂停；就绪后再次可运行   ⑤ 本地不足时从其他队列找任务',25,'#d9ece4')
text(100,1780,'G = goroutine　　P = 调度资源　　M = 操作系统线程　　实线箭头表示可能的流转',22,'#a9c8c0')
s.append('</svg>')
open(p,'w').write('\n'.join(s))
