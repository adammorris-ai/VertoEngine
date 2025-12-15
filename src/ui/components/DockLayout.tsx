import DockLayout from 'rc-dock';
import "rc-dock/dist/rc-dock.css";
import { Palette } from '../panels/Palette';
import { Assets } from '../panels/Assets';
import { Inspector } from '../panels/Inspector';
import { SceneEditor } from '../editors/SceneEditor';
import { GraphEditor } from '../editors/GraphEditor';

export const MainLayout = () => {
  const defaultLayout = {
    dockbox: {
      mode: 'horizontal',
      children: [
        {
          mode: 'vertical',
          size: 250,
          children: [
             { tabs: [{ id: 'palette', title: 'Palette', content: <Palette /> }] },
             { tabs: [{ id: 'assets', title: 'Assets', content: <Assets /> }] }
          ]
        },
        {
          mode: 'horizontal',
          children: [
            { 
               tabs: [
                 { id: 'graph', title: 'Blueprint Graph', content: <GraphEditor /> },
                 { id: 'scene', title: 'Scene', content: <SceneEditor /> }
               ] 
            }
          ]
        },
        {
          size: 300,
          tabs: [{ id: 'inspector', title: 'Inspector', content: <Inspector /> }]
        }
      ]
    }
  };
  
  return (
    <DockLayout 
      defaultLayout={defaultLayout as any} 
      style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} 
    />
  );
}
