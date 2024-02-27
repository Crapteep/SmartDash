import React, { useState } from "react";
import _ from "lodash";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Widget from "./Widget";
import Chart from "./LineChart";
import AreaChart from "./AreaChart";
import BarChart from "./BarChart";
import ScatterChart from "./ScatterChart";
import OutlinedButton from "./Buttons/OutlinedButton";
import MyButton from "./Buttons/MyButton";
import TopBar from "./TopBar";



const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalItems = ["a", "b", "c", "d", "e", "f"];

const componentList = {
  a: Chart,
  b: AreaChart,
  c: BarChart,
  d: ScatterChart,
  e: OutlinedButton,
  f: MyButton,
};



const DropDrag = ({
  props,
  layout,
  setLayout,
  deviceList,
  selectedDevice,

  handleUpdateLayout,
  handleChangeDevice,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const URL = import.meta.env.VITE_APP_API_URL;


  const handleButtonClick = () => {
    console.log("handlebuttonclick");
    if (isEditMode) {
      onLayoutSave();
    }
    setIsEditMode((prevEditMode) => !prevEditMode);
    setIsDraggable((prevDraggable) => !prevDraggable)
  };

  const onLayoutChange = (new_layout, layouts) => {
    if (isEditMode) {
      const updatedLayout = layout.map(originalLayoutItem => {
        const newLayoutItem = new_layout.find(item => item.i === originalLayoutItem.instanceId);
        if (newLayoutItem) {
          return {
            ...newLayoutItem,
            i: originalLayoutItem.i,
            instanceId: originalLayoutItem.instanceId,
            settings: originalLayoutItem.settings
          };
        }
        return originalLayoutItem;
      });
      setLayout(updatedLayout);
      console.log('po update: ', updatedLayout);
    }
  };
  
  

  const onLayoutSave = () => {
    handleUpdateLayout();
  };

  const onRemoveItem = (itemId) => {
    const updatedLayout = layout.filter(item => item.instanceId !== itemId);
    setLayout(updatedLayout);
  };

  const onUpdateSettings = (newSettings, instanceId) => {
    console.log(instanceId, newSettings)
    const updatedLayout = layout.map(item => {
      if (item.instanceId === instanceId) {
        return { ...item, settings: newSettings };
      }
      return item;
    });

    setLayout(updatedLayout);
  }

  const handleTestButtonClick = () => {
    console.log(
      "layout ->",
      layout,
      selectedDevice
    );
    console.log('url', URL)
  
  };

  return (
    <>
      {/* <button onClick={handleTestButtonClick}>test</button> */}
      <TopBar
        layout={layout}
        setLayout={setLayout}
        originalItems={originalItems}
        isEditMode={isEditMode}
        handleButtonClick={handleButtonClick}
        deviceList={deviceList}
        selectedDevice={selectedDevice}
        handleChangeDevice={handleChangeDevice}
      />
      <div className="mb-4 layout">
        <ResponsiveReactGridLayout
          {...props}
          style={{ border: "1px solid #ccc", borderRadius: "4px" }}
          layout={layout}
          cols={{ lg: 24, md: 24, sm: 24, xs: 24, xxs: 24 }}
          rowHeight={30}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          measureBeforeMount={false}
          // useCSSTransforms={mounted}
          onLayoutChange={onLayoutChange}
          isDroppable={true}
          isDraggable={isDraggable}
          isResizable={isEditMode}
        >
           {layout && layout.length > 0 ? (
            layout.map((item, index) => {
              return (
                <div key={item.instanceId} data-grid={item}>
                  <Widget
                    id={item.instanceId}
                    onRemoveItem={onRemoveItem}
                    component={componentList[item.i]}
                    settings={item.settings}
                    isEditMode={isEditMode}
                    setIsDraggable={setIsDraggable}
                    windowHeight={window.innerHeight}
                    selectedDevice={selectedDevice}
                    onUpdateSettings={onUpdateSettings}
                  />
                </div>
              );
            })
          ) : (
            <p>No items in layout</p>
)}



        </ResponsiveReactGridLayout>
      </div>
    </>
  );
};

export default DropDrag;
