USE [galaxy_new]
GO
/****** Object:  StoredProcedure [dbo].[uspComitGetTagsByComponentId]    Script Date: 6/9/2017 12:11:26 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		condelucic
-- Create date: 2017-06-09
-- Description:	Get Tags for a given Component Id
-- =============================================
ALTER PROCEDURE [dbo].[uspComitGetTagsByComponentId] 
 (@componentId uniqueidentifier)
AS

SELECT	[Tag].[Id], [Tag].[Name] AS TagName, [TagType].[Name] AS TagType, 
	[CoMIT_Component].Name AS ComponentName, [CoMIT_Component].[Id] AS ComponentId 
	[CoMIT_TagComponent].[Id] AS TagComponentId 
	FROM [CoMIT_Component]
	INNER JOIN [CoMIT_TagComponent] ON [CoMIT_Component].[Id] = [CoMIT_TagComponent].[ComponentId]
	INNER JOIN [Tag] ON [CoMIT_TagComponent].[TagId] = [Tag].[Id]
	INNER JOIN [TagType] ON [Tag].[TagTypeId] = [TagType].[Id]
	INNER JOIN [CoMIT_ComponentType] ON [CoMIT_Component].[ComponentTypeId] = [CoMIT_ComponentType].[Id]
WHERE [CoMIT_TagComponent].[ComponentId] = @componentId